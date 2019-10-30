import React, { Component } from 'react';
import {
  View, TouchableOpacity, Text, TextInput, Image,
} from 'react-native';

import Button from '../components/Button';

import images from '../constants/images';
import colours from '../constants/colours';
import { signInStyles } from '../styles';


const styles = signInStyles;
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

  onPressSignIn = () => {
    this.props.navigation.navigate('SignIn');
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
      <View style={[styles.containerStyle]}>
        <View style={[styles.formStyle]}>
          <Image
            source={images.logoDark}
            style={[styles.imageStyle]}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder="First Name"
            value={firstName}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({ lastName: text })}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder="Last Name"
            value={lastName}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({ lastName: text })}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder="Email"
            value={email}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({ email: text })}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder="Password"
            value={password}
            secureTextEntry={showPassword}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({ password: text })}
          />
          <TouchableOpacity
            style={[styles.linkStyle]}
            onPress={this.togglePasswordView}
          >
            <Text style={[styles.textStyle]}>{showPasswordText}</Text>
          </TouchableOpacity>

          <Button
            title="Sign Up"
            textColor={colours.blue}
            backgroundColor="white"
            style={[styles.buttonStyle]}
            onPress={this.onPressSignIn}
          />
        </View>
      </View>
    );
  }
}
