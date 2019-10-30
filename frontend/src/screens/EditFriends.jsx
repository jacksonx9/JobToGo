import React, { Component } from 'react';
import {
  View, FlatList, Text, TextInput,
} from 'react-native';
import axios from 'axios';

import Button from '../components/Button';
import SelectableItem from '../components/SelectableItem';
import Loader from '../components/Loader';
import NavHeader from '../components/NavHeader';

import images from '../constants/images';
import colours from '../constants/colours';
import config from '../constants/config';
import { editFriendsStyles } from '../styles';


const styles = editFriendsStyles;
export default class EditFriends extends Component {
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
    const { userId } = global;
    const friends = await axios.get(`${config.serverIp}/users/getFriends/${userId}`)
      .catch((e) => console.log(e));
    const friendRequests = await axios.get(`${config.serverIp}/users/getPendingFriends/${userId}`)
      .catch((e) => console.log(e));

    this.setState({
      friends: friends.data,
      friendRequests: friendRequests.data,
      loading: 0,
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState != this.state) {
      const { userId } = global;
      const friends = await axios.get(`${config.serverIp}/users/getFriends/${userId}`)
        .catch((e) => console.log(e));
      const friendRequests = await axios.get(`${config.serverIp}/users/getPendingFriends/${userId}`)
        .catch((e) => console.log(e));

      this.setState({
        friends: friends.data,
        friendRequests: friendRequests.data,
        loading: 0,
      });
    }
  }

  addFriend = async () => {
    const friend = await axios.get(`${config.serverIp}/users/${this.state.addFriendName}`)
      .catch((e) => console.log(e));

    await axios.post(`${config.serverIp}/users/addFriend/`, {
      userId: global.userId,
      friendId: friend.data._id,
    }).catch((e) => console.log(e));

    alert(`Sent a friend request to ${this.state.addFriendName}`);
  }

  comfirmFriendRequest = async (item, index) => {
    const { userId } = global;
    await axios.post(`${config.serverIp}/users/confirmFriend/`, {
      userId,
      friendId: item._id,
    }).catch((e) => console.log(e));

    const friends = await axios.get(`${config.serverIp}/users/getFriends/${userId}`)
      .catch((e) => console.log(e));
    const friendRequests = await axios.get(`${config.serverIp}/users/getPendingFriends/${userId}`)
      .catch((e) => console.log(e));

    this.setState({
      friends: friends.data,
      friendRequests: friendRequests.data,
      loading: 0,
    });

    alert(`Confirmed friend request from ${item.userName}`);
  }

  removeFriend = async (item) => {
    const { userId } = global;
    await axios.delete(`${config.serverIp}/users/removeFriend/`, {
      data: {
        userId,
        friendId: item._id,
      },
    }).catch((e) => console.log(e));

    const friends = await axios.get(`${config.serverIp}/users/getFriends/${userId}`)
      .catch((e) => console.log(e));
    const friendRequests = await axios.get(`${config.serverIp}/users/getPendingFriends/${userId}`)
      .catch((e) => console.log(e));

    this.setState({
      friends: friends.data,
      friendRequests: friendRequests.data,
      loading: 0,
    });

    alert(`Removed ${item.userName} from your friends`);
  }

  static navigationOptions = {
    drawerLabel: 'Friends',
  }

  render() {
    if (this.state.loading) return <Loader />;

    return (
      <View style={[styles.containerStyle]}>
        <NavHeader
          title="Friends"
          image={images.iconSend}
          onPressBack={() => this.props.navigation.goBack()}
          onPressBtn={this.addFriends}
          enableBtn={false}
        />
        <View style={[styles.searchBarStyle]}>
          <TextInput
            style={styles.inputStyle}
            placeholder="Add a friend"
            value={this.state.addFriendName}
            placeholderTextColor={colours.Gray}
            onChangeText={(text) => this.setState({ addFriendName: text })}
          />
          <Button
            backgroundColor="#E6E6E6"
            textColor="#1F1E1F"
            title="Add"
            textColor="white"
            backgroundColor={colours.blue}
            style={[styles.buttonStyle]}
            onPress={this.addFriend}
          />
        </View>
        <Text>Friend Requests</Text>
        <FlatList
          style
          data={this.state.friendRequests}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <SelectableItem
              key={item._id}
              header={item.userName}
              subHeader={item.email}
              onPress={() => this.comfirmFriendRequest(item, index)}
              actionIcon="+"
            />
          )}
        />
        <View style={[styles.dividerStyle]}>
          <Text>Your Friends</Text>
        </View>
        <FlatList
          style
          data={this.state.friends}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <SelectableItem
              key={item._id}
              header={item.userName}
              subHeader={item.email}
              onPress={() => this.removeFriend(item, index)}
              actionIcon="x"
            />
          )}
        />
      </View>
    );
  }
}