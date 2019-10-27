import React, { Component } from 'react';
import { View, TouchableOpacity, Text, TextInput, Image, StyleSheet } from 'react-native';
import { Button } from '../components';
import { images, colours, fonts } from '../constants'

export default class SignUp extends Component {

  text = {
    showPassword: 'Show Password',
    hidePassword: 'Hide Password'
  }

  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      showPassword: true,
      showPasswordText: this.text.showPassword
    };
  }

  onPressSignIn = () => {
    this.props.navigation.navigate('SignIn')
  }

  togglePasswordView = () => {
    this.setState({
      showPassword: !this.state.showPassword,
      showPasswordText: this.state.showPassword ?
        this.text.hidePassword : this.text.showPassword
    })
  }

  render() {
    return (
      <View style={[styles.containerStyle]}>
        <View style={[styles.formStyle]}>
          <Image
            source={images.logoDark}
            style={[styles.imageStyle]}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder={'First Name'}
            value={this.state.firstName}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({ lastName: text })}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder={'Last Name'}
            value={this.state.lastName}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({ lastName: text })}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder={'Email'}
            value={this.state.email}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({ email: text })}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder={'Password'}
            value={this.state.password}
            secureTextEntry={this.state.showPassword}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({ password: text })}
          />
          <TouchableOpacity
            style={[styles.linkStyle]}
            onPress={this.togglePasswordView}
          >
            <Text style={[styles.textStyle]}>{this.state.showPasswordText}</Text>
          </TouchableOpacity>

          <Button
            backgroundColor={'#E6E6E6'}
            textColor={'#1F1E1F'}
            title={'Sign Up'}
            textColor={colours.blue}
            backgroundColor='white'
            style={[styles.buttonStyle]}
            onPress={this.onPressSignIn}
          />
        </View>
      </View>
    );
  };
};


const styles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.blue
  },
  formStyle: {
    paddingTop: 100,
    height: '100%',
    width: '80%',
  },
  imageStyle: {
    height: 100,
    width: '100%',
    marginBottom: 40
  },
  inputStyle: {
    height: 50,
    width: '100%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'white',
    backgroundColor: colours.darkBlue,
    fontFamily: fonts.normal,
  },
  buttonStyle: {
    marginTop: 5,
    marginBottom: 20
  },
  linkStyle: {
    alignItems: 'flex-start',
    marginBottom: 10
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white'
  }
});
