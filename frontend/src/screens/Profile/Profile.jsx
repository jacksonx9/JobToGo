import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Logger from 'js-logger';
import { GoogleSignin } from 'react-native-google-signin';

import Button from '../../components/Button';
import NavHeader from '../../components/NavHeader/NavHeader';
import styles from './styles';
import { colours } from '../../styles';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.logger = Logger.get(this.constructor.name);
  }

  render() {
    const { navigation } = this.props;
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
