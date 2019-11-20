import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import Search from '../../components/Search';
import SelectableItem from '../../components/SelectableItem';
import Loader from '../../components/Loader';
import InfoDisplay from '../../components/InfoDisplay';
import NavHeader from '../../components/NavHeader';
import SwitchableNav from '../../components/SwitchableNav';
import config from '../../constants/config';
import { status } from '../../constants/messages';
import styles from './styles';

export default class EditFriends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      pendingFriends: [],
      addFriendName: '',
      loading: 1,
      showPendingFriends: true,
      searchInProgress: false,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
    this.fetchFriends();
  }

  async componentDidUpdate(prevState) {
    if (prevState !== this.state) {
      // this.fetchFriends();
    }
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

  addFriend = async () => {
    const { addFriendName } = this.state;
    const { userId } = global;
    const friend = await axios.get(`${config.ENDP_USERS}${addFriendName}`)
      .catch(e => this.logger.error(e));

    await axios.post(config.ENDP_FRIENDS, {
      userId,
      friendId: friend.data.result._id,
    }).catch(e => this.logger.error(e));
  }

  comfirmFriendRequest = async item => {
    const { userId } = global;
    await axios.post(config.ENDP_CONFIRM_FRIENDS, {
      userId,
      friendId: item._id,
    }).catch(e => this.logger.error(e));

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

  removeFriend = async item => {
    const { userId } = global;
    await axios.delete(config.ENDP_FRIENDS, {
      data: {
        userId,
        friendId: item._id,
      },
    }).catch(e => this.logger.error(e));

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

  searchUsers = async text => {
    // TODO: get query response from server
    this.setState({ addFriendName: text });
  }

  render() {
    const {
      loading, addFriendName, pendingFriends, friends, showPendingFriends, searchInProgress,
    } = this.state;

    let users;
    let onPress;
    let noUsersMsg;
    let actionIcon;
    if (searchInProgress) {
      users = friends; // TODO: change to user query results
      onPress = this.addFriend;
      noUsersMsg = status.noResults;
      actionIcon = '+';
    } else if (showPendingFriends) {
      users = pendingFriends;
      onPress = this.comfirmFriendRequest;
      noUsersMsg = status.noPendingFriends;
      actionIcon = '+';
    } else {
      users = friends;
      onPress = this.removeFriend;
      noUsersMsg = status.noFriends;
      actionIcon = 'x';
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
            subHeader={item.email}
            onPress={() => onPress(item, index)}
            actionIcon={actionIcon}
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
          value={addFriendName}
          onChangeText={text => this.searchUsers(text)}
          onEndSearch={() => {
            this.setState({ addFriendName: '', searchInProgress: false });
            this.addFriend(); // TODO: Remove this once user search is implemented
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
          navOption1Title="Pending Friends"
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
