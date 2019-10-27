import React, { Component } from 'react';
import { View, TouchableOpacity, Text, TextInput, Image, StyleSheet } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import axios from 'axios';

import { Button } from '../components';
import { images, colours, fonts, serverIp } from '../constants'


export default class SignIn extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  onPressSignIn = async () => {
    global.userId = 'debug_userId'
    this.props.navigation.navigate('App')
  }

  onPressGoogleSignIn = async () => {
    try {
      await GoogleSignin.configure({
        webClientId: '617405875578-f23h0uql1ol1qhk64qd16mcubqludhah.apps.googleusercontent.com'
      });

      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()

      const firebaseToken = global.firebaseToken
      console.log(`Firebase token: ${global.firebaseToken}`)

      const ret = await axios.post(serverIp + '/users/googleLogin/',
        {
          idToken: userInfo.idToken,
          firebaseToken: firebaseToken.firebaseToken
        }
      )

      global.userId = ret.data
      this.props.navigation.navigate('App')

    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Google sign in cancelled')
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Google sign in in progress already')
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Googlep Play service not available')
      } else {
        console.log(error)
      }
    }
  };

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
            placeholder={'Email'}
            value={this.state.email}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({ email: text })}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder={'Password'}
            value={this.state.password}
            secureTextEntry={true}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({ password: text })}
          />

          <Button
            backgroundColor={'#E6E6E6'}
            textColor={'#1F1E1F'}
            title={'Sign In'}
            textColor={colours.blue}
            backgroundColor='white'
            style={[styles.buttonStyle]}
            onPress={this.onPressSignIn}
          />
          <View style={[styles.linkStyle]}>
            <Text style={[styles.textStyle]}>or</Text>
          </View>

          <GoogleSigninButton
            style={[styles.buttonStyle]}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={this.onPressGoogleSignIn}
            disabled={false} />

          <TouchableOpacity
            style={[styles.linkStyle]}
            onPress={() => { this.props.navigation.navigate('SignUp') }}
          >
            <Text style={[styles.textStyle]}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.linkStyle]}
            onPress={() => { this.props.navigation.navigate('SignUp') }}
          >
            <Text style={[styles.textStyle]}>Forgot Password</Text>
          </TouchableOpacity>
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
    position: 'absolute'
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
    marginBottom: 20,
    width: '100%',
    height: 50
  },
  linkStyle: {
    alignItems: 'center'
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white'
  }
});
