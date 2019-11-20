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
      username: '',
      email: '',
      password: '',
      showPassword: true,
      showPasswordText: this.text.showPassword,
      invalidUsername: false,
      invalidEmail: false,
      blank: false,
    };
    this.logger = Logger.get(this.constructor.name);

  }

  onPressSignUp = async () => {
    const { navigation } = this.props;
    navigation.navigate('CreateUsername'); // temp for debugging
    const { username, email, password } = this.state;
    if (username.length === 0 || email.length === 0 || password.length === 0) {
      this.setState({ blank: true });
      return;
    }
    this.setState({ blank: false });

    const ret = await axios.post(`${config.ENDP_USERS}`,
      {
        credentials: {
          email,
          // idToken: global.newId.idToken,
          // firebaseToken: global.newId.firebaseToken,
          username,
          password,
        },
      }).catch(e => this.logger(e));

    // const ret = await axios.post().catch(e => this.logger(e));
    if (ret.data.status !== '400') { // Username and email are available
      global.userId = ret.data.result;
      navigation.navigate('app');
    }
    else { // Username or email is not available
      this.setState({
        invalidUsername: ret.body.username,
        invalidEmail: ret.body.email,
      });
    }

    this.setState({
      invalidUsername: true,
      invalidEmail: true,
    });
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
      username, email, password, showPassword, showPasswordText, invalidUsername, invalidEmail, blank,
    } = this.state;
    return (
      <View style={styles.container}>
        <Image
          source={images.logoLight}
          style={styles.logo}
        />
        <TextInput
          style={styles.inputContainer}
          placeholder="Username"
          value={username}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ username: text, invalidUsername: false }); }}
        />
        {invalidUsername ? <Text>{`Username "${username}" already taken`}</Text>
          : <Text />}
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
