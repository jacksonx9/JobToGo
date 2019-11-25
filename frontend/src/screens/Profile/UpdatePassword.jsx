import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';
import Toast from 'react-native-simple-toast';

import ErrorDisplay from '../../components/ErrorDisplay';
import Button from '../../components/Button';
import NavHeader from '../../components/NavHeader/NavHeader';
import config from '../../constants/config';
import { status, errors } from '../../constants/messages';
import styles from './styles';
import { colours } from '../../styles';

export default class UpdatePassword extends Component {
  text = {
    showPassword: 'Show Password',
    hidePassword: 'Hide Password',
  }

  constructor(props) {
    super(props);
    this.state = {
      password: '',
      invalidPassword: false,
      blank: false,
      showPassword: true,
      showPasswordText: this.text.showPassword,
      showErrorDisplay: false,
      errorDisplayText: errors.default,
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
      Toast.show(status.passwordUpdated);
      navigation.navigate('Profile');
    } catch (e) {
      if (!e.response || e.response.data.status !== 400) {
        this.setState({
          showErrorDisplay: true,
          errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
        });
      } else {
        this.setState({ invalidPassword: true });
      }
    }
  }

  togglePasswordView = () => {
    const { showPassword } = this.state;
    this.setState({
      showPassword: !showPassword,
      showPasswordText: showPassword
        ? this.text.hidePassword : this.text.showPassword,
    });
  }

  render() {
    const { navigation } = this.props;
    const {
      password, invalidPassword, blank, showPassword, showPasswordText,
      showErrorDisplay, errorDisplayText,
    } = this.state;
    return (
      <View style={styles.container}>
        <NavHeader
          title="Update Password"
          leftButtonOption="back"
          onPressLeftButton={() => navigation.goBack()}
        />
        <ErrorDisplay
          showDisplay={showErrorDisplay}
          setShowDisplay={show => this.setState({ showErrorDisplay: show })}
          displayText={errorDisplayText}
          style={styles.errorDisplay}
        />
        <Text style={styles.text}>
          Enter a new password
        </Text>
        <TextInput
          style={styles.inputContainer}
          placeholder="New password"
          secureTextEntry={showPassword}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ password: text, invalidPassword: false }); }}
        />
        <TouchableOpacity
          onPress={this.togglePasswordView}
        >
          <Text style={styles.link}>{showPasswordText}</Text>
        </TouchableOpacity>
        {invalidPassword
          ? <Text style={styles.warning}>{`password "${password}" already taken`}</Text>
          : <Text />}
        <Button
          backgroundColor={colours.accentPrimary}
          title="Update password"
          textColor={colours.white}
          style={styles.button}
          onPress={() => this.onPressUpdate()}
        />
        {blank ? <Text style={styles.warning}>Fields must not be blank</Text>
          : <Text />}
      </View>
    );
  }
}
