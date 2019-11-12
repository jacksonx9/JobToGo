import React, { Component } from 'react';
import {
  View, TouchableOpacity, Text, TextInput, Image,
} from 'react-native';

import Button from '../../components/Button';
import images from '../../constants/images';
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
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      showPassword: true,
      showPasswordText: this.text.showPassword,
    };
  }

  onPressSignUp = () => {
    const { navigation } = this.props;
    navigation.navigate('SignIn');
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
      firstName, lastName, email, password, showPassword, showPasswordText,
    } = this.state;
    return (
      <View style={styles.container}>
        <Image
          source={images.logoLight}
          style={styles.logo}
        />
        <TextInput
          style={styles.inputContainer}
          placeholder="First Name"
          value={firstName}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ lastName: text }); }}
        />
        <TextInput
          style={styles.inputContainer}
          placeholder="Last Name"
          value={lastName}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ lastName: text }); }}
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
      </View>
    );
  }
}
