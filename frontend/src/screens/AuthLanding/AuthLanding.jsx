import React, { Component } from 'react';
import { View, Image } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import axios from 'axios';
import Logger from 'js-logger';

import Button from '../../components/Button';
import images from '../../constants/images';
import config from '../../constants/config';
import { colours } from '../../styles';
import styles from './styles';

export default class AuthLanding extends Component {
  constructor(props) {
    super(props);
    this.logger = Logger.get(this.constructor.name);
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
      this.logger.info(`Firebase token: ${global.firebaseToken}`);

      const ret = await axios.post(`${config.ENDP_GOOGLE}`,
        {
          idToken: userInfo.idToken,
          firebaseToken,
        });

      if (typeof (ret.data.result) === 'string') {
        global.userId = ret.data.result;
        navigation.navigate('App');
      } else {
        global.newId = ret.data.result;
        navigation.navigate('CreateUsername');
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        this.logger.warn('Google sign in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        this.logger.warn('Google sign in in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        this.logger.error('Google Play service not available');
      } else {
        this.logger.error(error);
      }
    }
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <Image
          testID="logoLight"
          source={images.logoLight}
          style={styles.logo}
        />
        <Image
          testID="jobSeeker"
          source={images.jobSeeker}
          style={styles.image}
        />
        <View style={styles.buttonSection}>
          <GoogleSigninButton
            testID="google"
            style={styles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={this.googleSignIn}
            disabled={false}
          />
          <Button
            testID="signInAuth"
            title="Sign In"
            textColor={colours.white}
            backgroundColor={colours.accentPrimary}
            style={styles.signInButton}
            onPress={() => navigation.navigate('SignIn')}
          />
          <Button
            testID="signUp"
            title="Sign Up"
            textColor={colours.accentPrimary}
            backgroundColor="transparent"
            style={styles.signUpButton}
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      </View>
    );
  }
}
