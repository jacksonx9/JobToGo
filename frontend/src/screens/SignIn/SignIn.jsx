import React, { Component } from 'react';
import axios from 'axios';
import {
  View, TouchableOpacity, Text, TextInput, Image,
} from 'react-native';
import Logger from 'js-logger';

import Button from '../../components/Button';
import images from '../../constants/images';
import config from '../../constants/config';
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
      blank: false,
      showPassword: true,
      showPasswordText: this.text.showPassword,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  signIn = async () => {
    const { navigation } = this.props;
    const { firebaseToken } = global;
    const { userName, password } = this.state;
    if (userName.length === 0 || password.length === 0) {
      this.setState({ blank: true });
      return;
    }
    this.setState({ blank: false });

    this.logger.info(`Firebase token: ${firebaseToken}`);

    const ret = await axios.post(`${config.ENDP_LOGIN}`,
      {
        userName,
        password,
      }).catch(e => this.logger.log(e));
    if (ret) {
      global.userId = ret.data.result;
      navigation.navigate('App');
    } else {
      this.setState({ invalidLogin: true });
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
      userName, password, invalidLogin, blank, showPassword, showPasswordText,
    } = this.state;
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <Image
          testID="logoSignin"
          source={images.logoLight}
          style={styles.logo}
        />
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
        <TouchableOpacity
          onPress={() => { navigation.navigate('SignUp'); }}
        >
          <Text style={[styles.link]}>Forgot Password</Text>
        </TouchableOpacity>
        {invalidLogin ? <Text>Invalid Login</Text>
          : <Text />}
        {blank ? <Text>Fields must not be blank</Text>
          : <Text />}
      </View>
    );
  }
}
