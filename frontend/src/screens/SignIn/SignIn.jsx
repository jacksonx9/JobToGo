import React, { Component } from 'react';
import {
  View, TouchableOpacity, Text, TextInput, Image,
} from 'react-native';
import Logger from 'js-logger';

import Button from '../../components/Button';
import images from '../../constants/images';
import { colours } from '../../styles';
import styles from './styles';

export default class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
    this.logger = Logger.get(this.constructor.name);
  }

  signIn = async () => {
    const { navigation } = this.props;
    global.userId = '5dd2106bb16a1f002b503255';

    const { email, password } = this.state;

    if (email === 'a' && password === 'a') {
      global.userId = '5dd399d45085530034b454e2';
    }
    navigation.navigate('App');
  }

  render() {
    const { email, password } = this.state;
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
          placeholder="Email"
          value={email}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ email: text }); }}
        />
        <TextInput
          testID="password"
          style={styles.inputContainer}
          placeholder="Password"
          value={password}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ password: text }); }}
        />
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
      </View>
    );
  }
}
