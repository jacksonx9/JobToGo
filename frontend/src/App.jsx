import React from 'react';
import { Platform, Alert, YellowBox } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/Feather';
import firebase from 'react-native-firebase';
import Logger from 'js-logger';
import { string } from 'prop-types';
import socketIOClient from 'socket.io-client';

import config from './constants/config';
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp/SignUp';
import CreateUsername from './screens/CreateUsername/CreateUsername';
import AuthLanding from './screens/AuthLanding';
import JobSwipe from './screens/JobSwipe';
import SendLikedJobs from './screens/SendLikedJobs/SendLikedJobs';
import EditFriends from './screens/EditFriends/EditFriends';
import EditSkills from './screens/EditSkills/EditSkills';
import { colours, fonts, sizes } from './styles';
import { serverIp } from '../credentials/credentials';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    Logger.useDefaults();
    this.logger = Logger.get(this.constructor.name);
    this.socket = socketIOClient(serverIp);
  }

  async componentDidMount() {
    YellowBox.ignoreWarnings([
      'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, '
      + '`pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. '
      + 'Did you mean to put these under `headers`?',
    ]);

    this.socket.on(config.SOCKET_USERID, data => this.logger.info(data));

    if (Platform.OS === 'android') {
      try {
        await firebase.messaging().requestPermission();
        const fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
          this.logger.info('FCM Token: ', fcmToken);
          global.firebaseToken = fcmToken;
          const enabled = await firebase.messaging().hasPermission();
          if (enabled) {
            this.logger.info(`FCM messaging has permission:${enabled}`);
          } else {
            try {
              await firebase.messaging().requestPermission();
              this.logger.info('FCM permission granted');
            } catch (error) {
              this.logger.error('FCM Permission Error', error);
            }
          }
          this.createNotificationListeners();
        } else {
          this.logger.error('FCM Token not available');
        }
      } catch (e) {
        this.logger.error('Error initializing FCM', e);
      }
    }
  }

  componentWillUnmount() {
    this.notificationListener();
  }

  showAlert = (title, body) => {
    Alert.alert(
      title, body,
      [
        { text: 'OK', onPress: () => this.logger.info('OK Pressed') },
      ],
      { cancelable: false },
    );
  }

  createNotificationListeners = async () => {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification(notification => {
      const { title, body } = notification;
      this.showAlert(title, body);
    });
  }


  render() {
    const navConfig = {
      headerMode: 'none',
      navigationOptions: {
        headerVisible: false,
      },
    };

    const tabNavConfig = {
      initialRouteName: 'Home',
      tabBarOptions: {
        style: {
          height: 50,
          borderTopColor: 'transparent',
        },
        labelStyle: {
          fontFamily: fonts.bold,
        },
        activeTintColor: colours.accentPrimary,
        inactiveTintColor: colours.lightGray,
      },
    };

    function HomeTabIcon({ tintColor }) {
      return (<Icon name="home" size={sizes.icon} color={tintColor} />);
    }

    function LikedTabIcon({ tintColor }) {
      return (<Icon name="heart" size={sizes.icon} color={tintColor} />);
    }

    function FriendsTabIcon({ tintColor }) {
      return (<Icon name="users" size={sizes.icon} color={tintColor} />);
    }

    function ResumeTabIcon({ tintColor }) {
      return (<Icon name="upload" size={sizes.icon} color={tintColor} />);
    }

    const AppStack = createBottomTabNavigator(
      {
        Home: {
          screen: () => <JobSwipe socket={this.socket} />,
          navigationOptions: {
            tabBarLabel: 'Home',
            tabBarIcon: HomeTabIcon,
            tabBarTestID: 'home',
          },
        },
        Send: {
          screen: SendLikedJobs,
          navigationOptions: {
            tabBarLabel: 'Liked',
            tabBarIcon: LikedTabIcon,
            tabBarTestID: 'liked',
          },
        },
        Friends: {
          screen: () => <EditFriends socket={this.socket} />,
          navigationOptions: {
            tabBarLabel: 'Friends',
            tabBarIcon: FriendsTabIcon,
            tabBarTestID: 'friends',
          },
        },
        Resume: {
          screen: EditSkills,
          navigationOptions: {
            tabBarLabel: 'Resume',
            tabBarIcon: ResumeTabIcon,
            tabBarTestID: 'resume',
          },
        },
      },
      tabNavConfig,
    );

    const AuthStack = createStackNavigator(
      {
        AuthLanding,
        SignIn,
        SignUp,
        CreateUsername,
      },
      navConfig,
    );

    const AppContainer = createAppContainer(
      createSwitchNavigator(
        {
          Auth: AuthStack,
          App: AppStack,
        },
        {
          initialRouteName: 'Auth',
        },
      ),
    );

    HomeTabIcon.propTypes = {
      tintColor: string.isRequired,
    };

    LikedTabIcon.propTypes = {
      tintColor: string.isRequired,
    };

    FriendsTabIcon.propTypes = {
      tintColor: string.isRequired,
    };

    ResumeTabIcon.propTypes = {
      tintColor: string.isRequired,
    };

    return (
      <AppContainer
        styles={[{ flex: 1 }]}
      />
    );
  }
}
