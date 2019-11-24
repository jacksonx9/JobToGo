import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Logger from 'js-logger';
import axios from 'axios';
import { GoogleSignin } from 'react-native-google-signin';

import Button from '../../components/Button';
import NavHeader from '../../components/NavHeader/NavHeader';
import styles from './styles';
import { colours } from '../../styles';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      email: '',
    };
    this.logger = Logger.get(this.constructor.name);
  }

  async componentWillMount() {
    const { navigation } = this.props;
    this.fetchAccountInfo();
    navigation.addListener('willFocus', () => this.fetchAccountInfo());
  }

  fetchAccountInfo = async () => {
    const { userId } = global;
    try {
      const ret = await axios.get(`ENDP_USER_INFO${userId}`);
      const { userName, email } = ret.data.result;
      this.setState({ userName, email });
    } catch (e) {
      this.logger.error(e);
    }
  }

  render() {
    const { navigation } = this.props;
    const { userName, email } = this.state;

    return (
      <View style={styles.container}>
        <NavHeader
          title="Account"
          leftButtonOption="back"
          onPressLeftButton={() => navigation.navigate('TabStack')}
        />
        <Text style={styles.text}>
          Change your account settings
        </Text>
        <Text style={styles.text}>
          {userName}
        </Text>
        <Text style={styles.text}>
          {email}
        </Text>
        <Button
          backgroundColor={colours.accentPrimary}
          title="Update Username"
          textColor={colours.white}
          style={styles.button}
          onPress={() => navigation.navigate('UpdateUserName')}
        />
        <Button
          backgroundColor={colours.accentPrimary}
          title="Update Password"
          textColor={colours.white}
          style={styles.button}
          onPress={() => navigation.navigate('UpdatePassword')}
        />
        <Button
          backgroundColor={colours.accentPrimary}
          title="Log Out"
          textColor={colours.white}
          style={styles.button}
          onPress={async () => { await GoogleSignin.signOut(); navigation.navigate('Auth'); }}
        />
      </View>
    );
  }
}
