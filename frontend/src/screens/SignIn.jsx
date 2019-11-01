import React, { Component } from 'react';
import {
  View, TouchableOpacity, Text, TextInput, Image,
} from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import axios from 'axios';
import { logger } from 'react-native-logger';

import Button from '../components/Button';
import images from '../constants/images';
import colours from '../constants/colours';
import config from '../constants/config';
import { containerStyles, displayStyles, authStyles } from '../styles';


const styles = { ...containerStyles, ...displayStyles, ...authStyles };
export default class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  signIn = async () => {
    const { navigation } = this.props;
    global.userId = '5dbb7694ec463f002c5be3d5';
    // global.userId = 'debug_userId';
    navigation.navigate('App');
  }

  googleSignIn = async () => {
    const { navigation } = this.props;
    try {
      await GoogleSignin.configure({
        webClientId: config.webClientId,
      });

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const { firebaseToken } = global;
      logger.log(`Firebase token: ${global.firebaseToken}`);

      const ret = await axios.post(`${config.ENDP_GOOGLE}`,
        {
          idToken: userInfo.idToken,
          firebaseToken,
        });

      global.userId = ret.data.result;
      navigation.navigate('App');
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        logger.log('Google sign in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        logger.log('Google sign in in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        logger.log('Google Play service not available');
      } else {
        logger.log(error);
      }
    }
  }

  render() {
    const { email, password } = this.state;
    const { navigation } = this.props;
    return (
      <View style={[styles.flexColContainer, styles.accentBackground]}>
        <View style={[styles.formContainer]}>
          <Image
            source={images.logoDark}
            style={[styles.image]}
          />
          <TextInput
            style={[styles.inputContainer, styles.inputDark]}
            placeholder="Email"
            value={email}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => { this.setState({ email: text }); }}
          />
          <TextInput
            style={[styles.inputContainer, styles.inputDark]}
            placeholder="Password"
            value={password}
            secureTextEntry
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => { this.setState({ password: text }); }}
          />

          <Button
            title="Sign In"
            textColor={colours.blue}
            backgroundColor="white"
<<<<<<< HEAD
            style={[styles.button]}
            onPress={this.onPressSignIn}
=======
            style={[styles.buttonStyle]}
            onPress={this.signIn}
>>>>>>> a56ad76... fix codacy errors
          />
          <View style={[styles.alignCenter]}>
            <Text style={[styles.lightText]}>or</Text>
          </View>

          <GoogleSigninButton
            style={[styles.button]}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={this.googleSignIn}
            disabled={false}
          />

          <TouchableOpacity
            style={[styles.alignCenter]}
            onPress={() => { navigation.navigate('SignUp'); }}
          >
            <Text style={[styles.lightText]}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.alignCenter]}
            onPress={() => { navigation.navigate('SignUp'); }}
          >
            <Text style={[styles.lightText]}>Forgot Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
