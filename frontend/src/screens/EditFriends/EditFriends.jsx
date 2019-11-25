import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';
import { object } from 'prop-types';
import Toast from 'react-native-simple-toast';

import ErrorDisplay from '../../components/ErrorDisplay';
import Search from '../../components/Search';
import {SelectableItemLong} from '../../components/SelectableItem';
import Loader from '../../components/Loader';
import InfoDisplay from '../../components/InfoDisplay';
import OptionsModal from '../../components/OptionsModal';
import NavHeader from '../../components/NavHeader';
import SwitchableNav from '../../components/SwitchableNav';
import config from '../../constants/config';
import { errors, status } from '../../constants/messages';
import icons from '../../constants/icons';
import styles from './styles';

export default class EditFriends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      pendingFriends: [],
      searchedUsers: [],
      pendingFriendsIndex: 0,
      searchText: '',
      loading: true,
      showPendingFriends: true,
      searchInProgress: false,
      optionsModalIsVisible: false,
      showErrorDisplay: false,
      errorDisplayText: errors.default,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
    const { socket } = this.props;
    socket.on(config.SOCKET_PENDING, data => this.updatePendingFriends(data));
    socket.on(config.SOCKET_FRIENDS, data => this.updateFriends(data));
    socket.on(config.SOCKET_GET_SEARCH, data => this.updateSearchedUsers(data));
    this.fetchFriends();
  }

  fetchFriends = async () => {
    try {
      const { userId } = global;
      const friends = await axios.get(`${config.ENDP_FRIENDS}${userId}`);
      const pendingFriends = await axios.get(`${config.ENDP_PENDING_FRIENDS}${userId}`);

      this.setState({
        friends: friends.data.result,
        pendingFriends: pendingFriends.data.result,
        loading: false,
      });
    } catch (e) {
      this.setState({
        loading: false,
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  updateFriends = async data => {
    const friends = data.result;
    if (!friends) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: data.errorMessage,
      });
      return;
    }

    this.setState({
      friends,
    });
  }

  updatePendingFriends = async data => {
    const pendingFriends = data.result;
    if (!pendingFriends) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: data.errorMessage,
      });
      return;
    }

    this.setState({
      pendingFriends,
    });
  }

  updateSearchedUsers = async data => {
    const searchedUsers = data.result;
    if (!searchedUsers) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: data.errorMessage,
      });
      return;
    }

    this.setState({
      searchedUsers,
    });
  }

  addFriend = async item => {
    const { userId } = global;

    try {
      const friend = await axios.get(`${config.ENDP_USERS}${item.userName}`);

      await axios.post(config.ENDP_FRIENDS, {
        userId,
        friendId: friend.data.result._id,
      });
      this.setState({
        searchInProgress: false,
      });
      Toast.show(status.friendRequestSent);
    } catch (e) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  openOptionsModal = index => {
    this.setState({
      optionsModalIsVisible: true,
      pendingFriendsIndex: index,
    });
  }

  comfirmFriendRequest = async index => {
    const { userId } = global;
    const { pendingFriends, friends } = this.state;

    try {
      await axios.post(config.ENDP_CONFIRM_FRIEND_REQ, {
        userId,
        friendId: pendingFriends[index]._id,
      });

      const updatedFriends = [...friends];
      const updatedPendingFriends = [...pendingFriends];

      updatedFriends.push(pendingFriends[index]);
      updatedPendingFriends.splice(index, 1);

      this.setState({
        pendingFriends: updatedPendingFriends,
        friends: updatedFriends,
        optionsModalIsVisible: false,
        searchInProgress: false,
      });
    } catch (e) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  removeFriendRequest = async index => {
    const { userId } = global;
    const { pendingFriends } = this.state;

    try {
      await axios.delete(config.ENDP_PENDING_FRIENDS, {
        data: {
          userId,
          friendId: pendingFriends[index]._id,
        },
      });

      const updatedPendingFriends = [...pendingFriends];
      updatedPendingFriends.splice(index, 1);

      this.setState({
        pendingFriends: updatedPendingFriends,
        optionsModalIsVisible: false,
        searchInProgress: false,
      });
    } catch (e) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
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

      const friendIndex = index || friends.indexOf(friend => friend._id === item._id);

      const updatedFriends = [...friends];
      updatedFriends.splice(friendIndex, 1);
      this.setState({
        friends: updatedFriends,
        searchInProgress: false,
      });
    } catch (e) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
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

  searchableUserList = users => {
    const handleFriendOnPress = item => (
      (item.isFriend) ? this.removeFriend(item) : this.addFriend(item)
    );

    return (
      <FlatList
        testID="userList"
        data={users}
        keyExtractor={item => item._id}
        renderItem={({ item, index }) => (
          <SelectableItemLong
            testID={`userItem${index}`}
            key={item._id}
            header={item.userName}
            subHeader={item.email}
            noBanner={!item.isFriend}
            bannerText="friend"
            onPress={() => handleFriendOnPress(item)}
            iconName={item.isFriend ? icons.x : icons.plus}
          />
        )}
      />
    );
  };

  pendingFriendsList = pendingFriends => (
    <FlatList
      testID="userList"
      data={pendingFriends}
      keyExtractor={item => item._id}
      renderItem={({ item, index }) => (
        <SelectableItemLong
          testID={`userItem${index}`}
          key={item._id}
          header={item.userName}
          subHeader={item.email}
          onPress={() => this.comfirmFriendRequest(item, index)}
          iconName={icons.check}
          enableButton2
          iconName2={icons.x}
          onPress2={() => this.removeFriendRequest(item, index)}
        />
      )}
    />
  );


  friendsList = friends => (
    <FlatList
      testID="userList"
      data={friends}
      keyExtractor={item => item._id}
      renderItem={({ item, index }) => (
        <SelectableItemLong
          testID={`userItem${index}`}
          key={item._id}
          header={item.userName}
          subHeader={item.email}
          onPress={() => this.removeFriend(item, index)}
          iconName={icons.x}
        />
      )}
    />
  );

  render() {
    const {
      loading, searchText, pendingFriends, friends, searchedUsers,
      showPendingFriends, searchInProgress, pendingFriendsIndex, optionsModalIsVisible,
      showErrorDisplay, errorDisplayText,
    } = this.state;
    const { navigation } = this.props;

    let userList;
    let noUsersMsg;
    let noUsers;
    if (searchInProgress) {
      userList = this.searchableUserList(searchedUsers);
      noUsersMsg = status.noResults;
      noUsers = searchedUsers.length === 0;
    } else if (showPendingFriends) {
      userList = this.pendingFriendsList(pendingFriends);
      noUsersMsg = status.noPendingFriends;
      noUsers = pendingFriends.length === 0;
    } else {
      userList = this.friendsList(friends);
      noUsersMsg = status.noFriends;
      noUsers = friends.length === 0;
    }

    const friendContent = () => {
      if (showErrorDisplay) {
        return (
          <ErrorDisplay
            showDisplay={showErrorDisplay}
            setShowDisplay={show => this.setState({ showErrorDisplay: show })}
            displayText={errorDisplayText}
            style={styles.errorDisplay}
          />
        );
      }
      if (noUsers) {
        return <InfoDisplay message={noUsersMsg} />;
      }
      return userList;
    };

    if (loading) return <Loader />;
    if (searchInProgress) {
      return (
        <Search
          value={searchText}
          onChangeText={text => this.searchUsers(text)}
          onEndSearch={() => {
            this.setState({
              searchText: '',
              searchInProgress: false,
              showErrorDisplay: false,
            });
          }}
        >
          { friendContent() }
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
          leftButtonOption="search"
          onPressLeftButton={() => this.setState({
            searchInProgress: true,
            searchedUsers: [],
            searchText: '',
          })}
          rightButtonOption="menu"
          onPressRightButton={() => navigation.openDrawer()}
        />
        <SwitchableNav
          showNavOption1={showPendingFriends}
          navOption1Title="Friends Requests"
          navOption2Title="Your Friends"
          onPressNavOption1={() => { this.setState({ showPendingFriends: true }); }}
          onPressNavOption2={() => { this.setState({ showPendingFriends: false }); }}
        />
        <View style={[styles.listContainer]}>
          { friendContent() }
          <OptionsModal
            option1="Confirm"
            option2="Ignore"
            onPress1={this.comfirmFriendRequest}
            onPress2={this.removeFriendRequest}
            onPressExit={() => { this.setState({ optionsModalIsVisible: false }); }}
            isVisible={optionsModalIsVisible}
            index={pendingFriendsIndex}
          />
        </View>
      </View>
    );
  }
}

EditFriends.propTypes = {
  socket: object.isRequired, // eslint-disable-line react/forbid-prop-types
};
