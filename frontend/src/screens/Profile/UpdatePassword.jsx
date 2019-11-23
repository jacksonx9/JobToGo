import React, { Component } from 'react';
import {
  View, Image, Text, TextInput,
} from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import Button from '../../components/Button';
import NavHeader from '../../components/NavHeader/NavHeader';
import config from '../../constants/config';
import styles from './styles';
import { colours } from '../../styles';
import images from '../../constants/images';

export default class UpdatePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      invalidPassword: false,
      blank: false,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  onPressUpdate = async () => {
    const { navigation } = this.props;
    const { password } = this.state;
    const { userId } = global;
    if (password.length === 0) {
      this.setState({ blank: true });
      return;
    }
    this.setState({ blank: false });
    try {
      await axios.put(`${config.ENDP_UPDATE_PASSWORD}${userId}`, {
        password,
      });
      navigation.navigate('Profile');
    } catch (e) {
      this.setState({ invalidPassword: true });
      this.logger.error(e);
    }
  }

  render() {
    const { navigation } = this.props;
    const { password, invalidPassword, blank } = this.state;
    return (
      <View style={styles.container}>
        <NavHeader
          title="Update Password"
          leftButtonOption="back"
          onPressLeftButton={() => navigation.goBack()}
        />
        <Image
          source={images.checkingDoc}
          style={styles.image}
        />
        <Text style={styles.text}>
          Change your account settings
        </Text>
        <TextInput
          style={styles.inputContainer}
          placeholder="New password"
          value={password}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ password: text, invalidPassword: false }); }}
        />
        {invalidPassword ? <Text style={styles.text}>{`password "${password}" already taken`}</Text>
          : <Text />}
        <Button
          backgroundColor={colours.accentPrimary}
          title="Update password"
          textColor={colours.white}
          style={styles.button}
          onPress={() => this.onPressUpdate()}
        />
        {blank ? <text style={styles.text}>Fields must not be blank</Text>
          : <Text />}
      </View>
    );
  }
}
