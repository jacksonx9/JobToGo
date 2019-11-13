import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import SelectableItem from '../../components/SelectableItem';
import Loader from '../../components/Loader';
import NavHeader from '../../components/NavHeader';
import SwitchableNav from '../../components/SwitchableNav';
import config from '../../constants/config';
import styles from './styles';

export default class EditFriends extends Component {
  static navigationOptions = {
    drawerLabel: 'Friends',
  }

  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      pendingFriends: [],
      addFriendName: '',
      loading: 1,
      showPendingFriends: true,
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

  render() {
    const {
      loading, addFriendName, pendingFriends, friends, showPendingFriends,
    } = this.state;

    if (loading) return <Loader />;
    return (
      <View
        style={[styles.container]}
      >
        <NavHeader
          title="Friends"
          buttonOption="search"
          value={addFriendName}
          onChangeText={text => { this.setState({ addFriendName: text }); }}
          onEndSearch={() => this.addFriend()}
          onStartSearch={() => {}}
        />
        <SwitchableNav
          showNavOption1={showPendingFriends}
          navOption1Title="Pending Friends"
          navOption2Title="Your Friends"
          onPressNavOption1={() => { this.setState({ showPendingFriends: true }); }}
          onPressNavOption2={() => { this.setState({ showPendingFriends: false }); }}
        />
        <View style={[styles.listContainer]}>
          {showPendingFriends ? (
            <FlatList
              data={pendingFriends}
              keyExtractor={item => item._id}
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
          )
            : (
              <FlatList
                data={friends}
                keyExtractor={item => item._id}
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
            )}
        </View>
      </View>
    );
  }
}
