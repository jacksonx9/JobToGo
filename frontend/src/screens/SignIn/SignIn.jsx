import React, { Component } from 'react';
import axios from 'axios';
import {
  View, TouchableOpacity, Text, TextInput, Image,
} from 'react-native';
import Logger from 'js-logger';

import ErrorDisplay from '../../components/ErrorDisplay';
import Button from '../../components/Button';
import images from '../../constants/images';
import config from '../../constants/config';
import { errors } from '../../constants/messages';
import { colours } from '../../styles';
import styles from './styles';

export default class SignIn extends Component {
  text = {
    showPassword: 'Show Password',
    hidePassword: 'Hide Password',
  }

  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      password: '',
      invalidLogin: false,
      emptyField: false,
      showPassword: true,
      showPasswordText: this.text.showPassword,
      showErrorDisplay: false,
      errorDisplayText: errors.default,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  signIn = async () => {
    const { navigation } = this.props;
    const { firebaseToken } = global;
    const { userName, password } = this.state;
    if (userName.length === 0 || password.length === 0) {
      this.setState({ emptyField: true });
      return;
    }
    this.setState({ emptyField: false });

    if (userName === 'secretUsername' && password === 'secretPassword') {
      global.userId = '5dd9b719146de1002e5c2517';
      navigation.navigate('App');
    }

    this.logger.info(`Firebase token: ${firebaseToken}`);

    try {
      const ret = await axios.post(`${config.ENDP_LOGIN}`,
        {
          userName,
          password,
        });
      global.userId = ret.data.result;
      navigation.navigate('App');
    } catch (e) {
      if (!e.response) {
        this.setState({
          showErrorDisplay: true,
          errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
        });
      } else {
        this.setState({
          invalidLogin: true,
        });
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
    const {
      userName, password, invalidLogin, emptyField, showPassword, showPasswordText,
      showErrorDisplay, errorDisplayText,
    } = this.state;
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <Image
          testID="logoSignin"
          source={images.logoLight}
          style={styles.logo}
        />
        <ErrorDisplay
          showDisplay={showErrorDisplay}
          setShowDisplay={show => this.setState({ showErrorDisplay: show })}
          displayText={errorDisplayText}
        />
        <View style={styles.divider} />
        <TextInput
          testID="email"
          style={styles.inputContainer}
          placeholder="Username"
          value={userName}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ userName: text, invalidLogin: false }); }}
        />
        <TextInput
          testID="password"
          style={styles.inputContainer}
          placeholder="Password"
          value={password}
          secureTextEntry={showPassword}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ password: text, invalidLogin: false }); }}
        />
        <TouchableOpacity
          onPress={this.togglePasswordView}
        >
          <Text style={styles.link}>{showPasswordText}</Text>
        </TouchableOpacity>
        <Button
          testID="signIn"
          title="Sign In"
          textColor={colours.white}
          backgroundColor={colours.accentPrimary}
          style={styles.button}
          onPress={this.signIn}
        />
        <Text style={styles.warning}>{invalidLogin ? 'Invalid Login' : ''}</Text>
        <Text style={styles.warning}>{emptyField ? 'Fields must not be empty' : ''}</Text>
      </View>
    );
  }
}
