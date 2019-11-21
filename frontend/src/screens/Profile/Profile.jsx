import React, { Component } from 'react';
import { View, Image, Text } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import Button from '../../components/Button';
import NavHeader from '../../components/NavHeader/NavHeader';
import config from '../../constants/config';
import styles from './styles';
import { colours } from '../../styles';
import images from '../../constants/images';

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
        />
        <Image
          source={images.checkingDoc}
          style={styles.image}
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
      </View>
    );
  }
}
