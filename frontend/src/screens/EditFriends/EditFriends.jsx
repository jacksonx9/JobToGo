import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';
import { object } from 'prop-types';

import Search from '../../components/Search';
import SelectableItem from '../../components/SelectableItem';
import Loader from '../../components/Loader';
import InfoDisplay from '../../components/InfoDisplay';
import NavHeader from '../../components/NavHeader';
import SwitchableNav from '../../components/SwitchableNav';
import config from '../../constants/config';
import { status } from '../../constants/messages';
import icons from '../../constants/icons';
import styles from './styles';

export default class EditFriends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      pendingFriends: [],
      searchedUsers: [],
      searchText: '',
      loading: 1,
      showPendingFriends: true,
      searchInProgress: false,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
    const { socket } = this.props;
    socket.on(config.SOCKET_PENDING, data => this.updatePendingFriends(data.result));
    socket.on(config.SOCKET_FRIENDS, data => this.updateFriends(data.result));
    socket.on(config.SOCKET_GET_SEARCH, data => this.updateSearchedUsers(data.result));
    this.fetchFriends();
  }

  fetchFriends = async () => {
    const { userId } = global;
    const friends = await axios.get(`${config.ENDP_FRIENDS}${userId}`)
      .catch(e => this.logger.error(e));
    const pendingFriends = await axios.get(`${config.ENDP_PENDING_FRIENDS}${userId}`)
      .catch(e => this.logger.error(e));

    this.setState({
      friends: friends.data.result,
      pendingFriends: pendingFriends.data.result,
      loading: 0,
    });
  }

  updateFriends = async friends => {
    this.logger.info(`Updating with  ${friends.length} friends`);
    this.setState({
      friends,
    });
  }

  updatePendingFriends = async pendingFriends => {
    this.logger.info(`Updating with  ${pendingFriends.length} pending friends`);
    this.setState({
      pendingFriends,
    });
  }

  updateSearchedUsers = async searchedUsers => {
    this.logger.info(`Updating with  ${searchedUsers.length} searched users`);
    this.setState({
      searchedUsers,
    });
  }

  addFriend = async item => {
    const { userId } = global;
    const friend = await axios.get(`${config.ENDP_USERS}${item.userName}`)
      .catch(e => this.logger.error(e));

    await axios.post(config.ENDP_FRIENDS, {
      userId,
      friendId: friend.data.result._id,
    }).catch(e => this.logger.error(e));
  }

  comfirmFriendRequest = async (item, index) => {
    const { userId } = global;
    const { pendingFriends } = this.state;

    try {
      await axios.post(config.ENDP_CONFIRM_FRIENDS, {
        userId,
        friendId: item._id,
      }).catch(e => this.logger.error(e));

      const updatedPendingFriends = [...pendingFriends];
      if (index > -1) {
        updatedPendingFriends.splice(index, 1);
        this.setState({ pendingFriends: updatedPendingFriends });
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  removeFriend = async (item, index) => {
    const { userId } = global;
    const { friends } = this.state;

    try {
      await axios.delete(config.ENDP_FRIENDS, {
        data: {
          userId,
          friendId: item._id,
        },
      });

      const updatedFriends = [...friends];
      if (index > -1) {
        updatedFriends.splice(index, 1);
        this.setState({ friends: updatedFriends });
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  searchUsers = async text => {
    const { socket } = this.props;
    socket.emit(config.SOCKET_SEND_SEARCH, text);

    this.setState({
      searchedUsers: [],
      searchText: text,
    });
  }

  getSelectableItemIcon = isFriend =>
    // if (isFriend) {
    //   return icons.x;
    // }
    // switch (userType) {
    //   case 'friend':
    //     return icons.x;
    //   case 'pending':
    //     return icons.moreVertical;
    //   default:
    //     return icons.plus;
    // }
    icons.plus
  ;

  render() {
    const {
      loading, searchText, pendingFriends, friends, searchedUsers,
      showPendingFriends, searchInProgress,
    } = this.state;

    let users;
    let onPress;
    let noUsersMsg;
    if (searchInProgress) {
      users = searchedUsers;
      onPress = this.addFriend;
      noUsersMsg = status.noResults;
    } else if (showPendingFriends) {
      users = pendingFriends;
      onPress = this.comfirmFriendRequest;
      noUsersMsg = status.noPendingFriends;
    } else {
      users = friends;
      onPress = this.removeFriend;
      noUsersMsg = status.noFriends;
    }

    const noUsers = users.length === 0;

    const userList = (
      <FlatList
        testID="userList"
        data={users}
        keyExtractor={item => item._id}
        renderItem={({ item, index }) => (
          <SelectableItem
            testID={`userItem${index}`}
            key={item._id}
            header={item.userName}
            subHeader={item.isFriend ? 'friend' : 'not a friend'}
            onPress={() => onPress(item, index)}
            iconName={this.getSelectableItemIcon(item)} // TODO: change this :(
          />
        )}
      />
    );

    const noUsersInfo = (
      <InfoDisplay message={noUsersMsg} />
    );

    if (loading) return <Loader />;
    if (searchInProgress) {
      return (
        <Search
          value={searchText}
          onChangeText={text => this.searchUsers(text)}
          onEndSearch={() => {
            this.setState({ searchText: '', searchInProgress: false });
          }}
        >
          {noUsers ? noUsersInfo : userList}
        </Search>
      );
    }
    return (
      <View
        testID="editFriends"
        style={[styles.container]}
      >
        <NavHeader
          testID="navHeaderFriends"
          title="Friends"
          buttonOption="search"
          onPressButton={() => { this.setState({ searchInProgress: true }); }}
        />
        <SwitchableNav
          showNavOption1={showPendingFriends}
          navOption1Title="Friends Requests"
          navOption2Title="Your Friends"
          onPressNavOption1={() => { this.setState({ showPendingFriends: true }); }}
          onPressNavOption2={() => { this.setState({ showPendingFriends: false }); }}
        />
        <View style={[styles.listContainer]}>
          {noUsers ? noUsersInfo : userList}
        </View>
      </View>
    );
  }
}

EditFriends.propTypes = {
  socket: object.isRequired, // eslint-disable-line react/forbid-prop-types
};
