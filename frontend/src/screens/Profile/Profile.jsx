import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Logger from 'js-logger';
import axios from 'axios';
import { GoogleSignin } from 'react-native-google-signin';

import ErrorDisplay from '../../components/ErrorDisplay';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import config from '../../constants/config';
import { errors } from '../../constants/messages';
import styles from './styles';
import { colours } from '../../styles';
import IconButton from '../../components/IconButton';
import icons from '../../constants/icons';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      email: '',
      loading: true,
      showErrorDisplay: false,
      errorDisplayText: errors.default,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
    const { navigation } = this.props;
    navigation.addListener('didFocus', () => this.fetchAccountInfo());
  }

  fetchAccountInfo = async () => {
    const { userId } = global;
    try {
      const ret = await axios.get(`${config.ENDP_USER_INFO}${userId}`);
      const { userName, email } = ret.data.result.credentials;
      this.setState({ userName, email, loading: false });
    } catch (e) {
      this.setState({
        loading: false,
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  render() {
    const { navigation } = this.props;
    const {
      userName, email, loading, showErrorDisplay, errorDisplayText,
    } = this.state;

    if (loading) return <Loader />;
    return (
      <View style={styles.profileContainer}>
        <View style={styles.infoContainer}>
          <View style={styles.buttonContainer}>
            <IconButton
              testID="closeDrawer"
              name={icons.chevronRight}
              color={colours.gray}
              size={icons.md}
              onPress={() => navigation.goBack()}
            />
          </View>
          <Text style={styles.title}>Account</Text>
          <ErrorDisplay
            showDisplay={showErrorDisplay}
            setShowDisplay={show => this.setState({ showErrorDisplay: show })}
            displayText={errorDisplayText}
          />
          <Text
            style={styles.centeredTextLarge}
            testID="userNameDisplay">
            {userName}
          </Text>
          <Text
            style={styles.centeredText}
            testID="emailDisplay">
            {email}
          </Text>
        </View>
        <View style={styles.navLinksContainer}>
          <Button
            testID="updateUserName"
            backgroundColor={colours.white}
            title="Update Username"
            textColor={colours.primary}
            style={styles.button}
            onPress={() => navigation.navigate('UpdateUserName')}
          />
          <Button
            testID="updatePassword"
            backgroundColor={colours.white}
            title="Update Password"
            textColor={colours.primary}
            style={styles.button}
            onPress={() => navigation.navigate('UpdatePassword')}
          />
          <Button
            testID="updateKeywords"
            backgroundColor={colours.white}
            title="Update Keywords"
            textColor={colours.primary}
            style={styles.button}
            onPress={() => navigation.navigate('KeywordList')}
          />
          <Button
            testID="logOut"
            backgroundColor={colours.white}
            title="Log Out"
            textColor={colours.accentPrimary}
            style={styles.button}
            onPress={async () => { navigation.navigate('Auth'); await GoogleSignin.signOut(); }}
          />
        </View>
      </View>
    );
  }
}
