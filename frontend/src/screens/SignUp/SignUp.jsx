import React, { Component } from 'react';
import {
  View, TouchableOpacity, Text, TextInput, Image,
} from 'react-native';
import Logger from 'js-logger';
import axios from 'axios';

import ErrorDisplay from '../../components/ErrorDisplay';
import Button from '../../components/Button';
import images from '../../constants/images';
import config from '../../constants/config';
import { errors } from '../../constants/messages';
import { colours } from '../../styles';
import styles from './styles';


export default class SignUp extends Component {
  text = {
    showPassword: 'Show Password',
    hidePassword: 'Hide Password',
  }

  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      email: '',
      password: '',
      showPassword: true,
      showPasswordText: this.text.showPassword,
      invalidUserName: false,
      invalidEmail: false,
      emptyField: false,
      showErrorDisplay: false,
      errorDisplayText: errors.default,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  onPressSignUp = async () => {
    const { navigation } = this.props;
    const { userName, email, password } = this.state;
    if (userName.length === 0 || email.length === 0 || password.length === 0) {
      this.setState({ emptyField: true });
      return;
    }
    this.setState({ emptyField: false });

    const { firebaseToken } = global;
    this.logger.info(`Firebase token: ${firebaseToken}`);

    try {
      const ret = await axios.post(`${config.ENDP_USERS}`,
        {
          userData:
          {
            credentials: {
              email,
              firebaseToken,
              userName,
              password,
            },
          },
        });
      global.userId = ret.data.result;
      navigation.navigate('App');
    } catch (e) {
      if (!e.response || !e.response.data
          || (e.response.data.result !== 'email' && e.response.data.result !== 'userName')) {
        this.setState({
          showErrorDisplay: true,
          errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
        });
      } else if (e.response.data.result === 'email') {
        this.setState({
          invalidEmail: true,
        });
      } else {
        this.setState({
          invalidUserName: true,
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
      userName, email, password, showPassword, showPasswordText,
      invalidUserName, invalidEmail, emptyField, showErrorDisplay, errorDisplayText,
    } = this.state;
    return (
      <View style={styles.container}>
        <Image
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
          style={styles.inputContainer}
          placeholder="Email"
          value={email}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ email: text, invalidEmail: false }); }}
        />
        <Text style={styles.warning}>{invalidEmail ? `Email "${email}" already taken` : ''}</Text>
        <TextInput
          style={styles.inputContainer}
          placeholder="Username"
          value={userName}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ userName: text, invalidUserName: false }); }}
        />
        <Text style={styles.warning}>
          {invalidUserName ? `Username "${userName}" already taken` : ''}
        </Text>
        <TextInput
          style={styles.inputContainer}
          placeholder="Password"
          value={password}
          secureTextEntry={showPassword}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ password: text }); }}
        />
        <TouchableOpacity

          onPress={this.togglePasswordView}
        >
          <Text style={styles.link}>{showPasswordText}</Text>
        </TouchableOpacity>

        <Button
          title="Sign Up"
          textColor={colours.white}
          backgroundColor={colours.accentPrimary}
          style={styles.button}
          onPress={this.onPressSignUp}
        />
        <Text style={styles.warning}>{emptyField ? 'Fields must not be empty' : ''}</Text>
      </View>
    );
  }
}
