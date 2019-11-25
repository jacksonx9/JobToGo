import React, { Component } from 'react';
import { View, Image } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import axios from 'axios';
import Logger from 'js-logger';

import ErrorDisplay from '../../components/ErrorDisplay';
import Button from '../../components/Button';
import images from '../../constants/images';
import config from '../../constants/config';
import { errors } from '../../constants/messages';
import { colours } from '../../styles';
import styles from './styles';

export default class AuthLanding extends Component {
  constructor(props) {
    super(props);
    this.logger = Logger.get(this.constructor.name);

    this.state = {
      showErrorDisplay: false,
      errorDisplayText: errors.default,
    };
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

      try {
        const ret = await axios.post(`${config.ENDP_GOOGLE}`,
          {
            idToken: userInfo.idToken,
            firebaseToken,
          });
        global.userId = ret.data.result;
        navigation.navigate('App');
      } catch (e) {
        if (!e.response || !e.response.data.result) {
          this.setState({
            showErrorDisplay: true,
            errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
          });
        } else {
          global.newId = e.response.data.result;
          navigation.navigate('CreateUsername');
        }
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        this.logger.warn('Google sign in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        this.logger.warn('Google sign in in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        this.setState({
          showErrorDisplay: true,
          errorDisplayText: 'Google Play service not available',
        });
      } else {
        this.setState({
          showErrorDisplay: true,
          errorDisplayText: errors.default,
        });
      }
    }
  }

  render() {
    const { navigation } = this.props;
    const { showErrorDisplay, errorDisplayText } = this.state;
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
        <ErrorDisplay
          showDisplay={showErrorDisplay}
          setShowDisplay={show => this.setState({ showErrorDisplay: show })}
          displayText={errorDisplayText}
          style={styles.errorDisplay}
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
            testID="signUpAuth"
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
