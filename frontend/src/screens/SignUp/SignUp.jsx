import React, { Component } from 'react';
import {
  View, TouchableOpacity, Text, TextInput, Image,
} from 'react-native';
import Logger from 'js-logger';
import axios from 'axios';

import Button from '../../components/Button';
import images from '../../constants/images';
import config from '../../constants/config';
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
      blank: false,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  onPressSignUp = async () => {
    const { navigation } = this.props;
    const { userName, email, password } = this.state;
    if (userName.length === 0 || email.length === 0 || password.length === 0) {
      this.setState({ blank: true });
      return;
    }
    this.setState({ blank: false });

    const { firebaseToken } = global;
    this.logger.info(`Firebase token: ${firebaseToken}`);

    this.logger.log('before');
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
      }).catch(e => {
      if (e.response.data.result === 'email') {
        this.setState({
          invalidEmail: true,
        });
      } else if (e.response.data.result === 'userName') {
        this.setState({
          invalidUserName: true,
        });
      } else {
        this.logger.log(e);
      }
    });
    this.logger.log(ret);
    if (ret) {
      global.userId = ret.data.result;
      navigation.navigate('App');
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
      invalidUserName, invalidEmail, blank,
    } = this.state;
    return (
      <View style={styles.container}>
        <Image
          source={images.logoLight}
          style={styles.logo}
        />
        <TextInput
          style={styles.inputContainer}
          placeholder="Email"
          value={email}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ email: text, invalidEmail: false }); }}
        />
        {invalidEmail ? <Text>{`Email "${email}" already taken`}</Text>
          : <Text />}
        <TextInput
          style={styles.inputContainer}
          placeholder="Username"
          value={userName}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ userName: text, invalidUserName: false }); }}
        />
        {invalidUserName ? <Text>{`Username "${userName}" already taken`}</Text>
          : <Text />}
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
        {blank ? <Text>Fields must not be blank</Text>
          : <Text />}
      </View>
    );
  }
}
