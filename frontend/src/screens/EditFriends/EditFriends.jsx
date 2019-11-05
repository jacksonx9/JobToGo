import React, { Component } from 'react';
import {
  View, FlatList, Text, TextInput,
} from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import SelectableItem from '../../components/SelectableItem';
import Loader from '../../components/Loader';
import NavHeader from '../../components/NavHeader';
import images from '../../constants/images';
import config from '../../constants/config';
import styles from './styles';
import SearchBar from '../../components/SeachBar';

export default class EditFriends extends Component {
  static navigationOptions = {
    drawerLabel: 'Friends',
  }

  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      friendRequests: [],
      addFriendName: '',
      loading: 1,
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
    const friendRequests = await axios.get(`${config.ENDP_PENDING_FRIENDS}${userId}`)
      .catch(e => this.logger.error(e));

    this.setState({
      friends: friends.data.result,
      friendRequests: friendRequests.data.result,
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
    const friendRequests = await axios.get(`${config.ENDP_PENDING_FRIENDS}${userId}`)
      .catch(e => this.logger.error(e));

    this.setState({
      friends: friends.data.result,
      friendRequests: friendRequests.data.result,
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
    const friendRequests = await axios.get(`${config.ENDP_PENDING_FRIENDS}${userId}`)
      .catch(e => this.logger.error(e));

    this.setState({
      friends: friends.data.result,
      friendRequests: friendRequests.data.result,
      loading: 0,
    });
  }

  render() {
    const {
      loading, addFriendName, friendRequests, friends,
    } = this.state;

    if (loading) return <Loader />;
    return (
      <View
        style={[styles.container]}
      >
        <NavHeader
          title="Liked Jobs"
          searchEnabled
          value={addFriendName}
          onChangeText={text => { this.setState({ addFriendName: text }); }}
          onEndSearch={() => { this.setState({ addFriendName: '' }); }}
          onStartSearch={() => {}}
        />
        <View style={[styles.buttonSection]}>
          <View style={styles.infoContainer} />
        </View>
        <View style={[styles.listContainer]}>
          <FlatList
            data={friendRequests}
            keyExtractor={item => item._id}
            renderItem={item => (
              <SelectableItem
                key={item._id}
                header={item.userName}
                subHeader={item.email}
                onPress={() => this.comfirmFriendRequest(item)}
                actionIcon="+"
              />
            )}
          />
        </View>
      </View>
    );
  }
}
