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
    global.userId = 'debug_userId';
    navigation.navigate('App');
  }

  render() {
    const { email, password } = this.state;
    const { navigation } = this.props;
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
          onChangeText={text => { this.setState({ email: text }); }}
        />
        <TextInput
          style={styles.inputContainer}
          placeholder="Password"
          value={password}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ password: text }); }}
        />
        <Button
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
