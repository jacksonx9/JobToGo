import React, { Component } from 'react';
import {
  View, FlatList, Text, TextInput,
} from 'react-native';
import axios from 'axios';
import { logger } from 'react-native-logger';

import Button from '../components/Button';
import SelectableItem from '../components/SelectableItem';
import Loader from '../components/Loader';
import NavHeader from '../components/NavHeader';
import images from '../constants/images';
import colours from '../constants/colours';
import config from '../constants/config';
import { containerStyles, editFriendsStyles } from '../styles';


const styles = { ...containerStyles, ...editFriendsStyles };
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
  }

  async componentDidMount() {
    this.fetchFriends();
  }

  async componentDidUpdate(prevState) {
    if (prevState !== this.state) {
      this.fetchFriends();
    }
  }

  fetchFriends = async () => {
    const { userId } = global;
    const friends = await axios.get(`${config.ENDP_FRIENDS}${userId}`)
      .catch((e) => { logger.log(e); });
    const friendRequests = await axios.get(`${config.ENDP_PENDING_FRIENDS}${userId}`)
      .catch((e) => { logger.log(e); });

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
      .catch((e) => { logger.log(e); });

    await axios.post(config.ENDP_FRIENDS, {
      userId,
      friendId: friend.data.result._id,
    }).catch((e) => { logger.log(e); });
  }

  comfirmFriendRequest = async (item) => {
    const { userId } = global;
    await axios.post(config.ENDP_CONFIRM_FRIENDS, {
      userId,
      friendId: item._id,
    }).catch((e) => { logger.log(e); });

    const friends = await axios.get(`${config.ENDP_FRIENDS}${userId}`)
      .catch((e) => { logger.log(e); });
    const friendRequests = await axios.get(`${config.ENDP_PENDING_FRIENDS}${userId}`)
      .catch((e) => { logger.log(e); });

    this.setState({
      friends: friends.data.result,
      friendRequests: friendRequests.data.result,
      loading: 0,
    });
  }

  removeFriend = async (item) => {
    const { userId } = global;
    await axios.delete(config.ENDP_FRIENDS, {
      data: {
        userId,
        friendId: item._id,
      },
    }).catch((e) => { logger.log(e); });

    const friends = await axios.get(`${config.ENDP_FRIENDS}${userId}`)
      .catch((e) => { logger.log(e); });
    const friendRequests = await axios.get(`${config.ENDP_PENDING_FRIENDS}${userId}`)
      .catch((e) => { logger.log(e); });

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
    const { navigation } = this.props;

    if (loading) return <Loader />;

    return (
      <View style={[styles.flexColContainer]}>
        <NavHeader
          title="Friends"
          image={images.iconSend}
          onPressBack={() => navigation.goBack()}
          onPressBtn={this.addFriends}
          enableBtn={false}
        />
        <View style={[styles.searchBar]}>
          <TextInput
            style={styles.input}
            placeholder="Add a friend"
            value={addFriendName}
            placeholderTextColor={colours.Gray}
            onChangeText={(text) => { this.setState({ addFriendName: text }); }}
          />
          <Button
            title="Add"
            textColor="white"
            backgroundColor={colours.blue}
            style={[styles.button]}
            onPress={this.addFriend}
          />
        </View>
        <Text>Friend Requests</Text>
        <FlatList
          style
          data={friendRequests}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <SelectableItem
              key={item._id}
              header={item.userName}
              subHeader={item.email}
              onPress={() => this.comfirmFriendRequest(item)}
              actionIcon="+"
            />
          )}
        />
        <View style={[styles.divider]}>
          <Text>Your Friends</Text>
        </View>
        <FlatList
          style
          data={friends}
          keyExtractor={(item) => (item._id)}
          renderItem={({ item }) => (
            <SelectableItem
              key={item._id}
              header={item.userName}
              subHeader={item.email}
              onPress={() => this.removeFriend(item)}
              actionIcon="x"
            />
          )}
        />
      </View>
    );
  }
}
