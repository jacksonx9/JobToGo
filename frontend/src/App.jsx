import React from 'react';
import { Platform, Alert } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import firebase from 'react-native-firebase';
import { logger } from 'react-native-logger';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import JobSwipe from './screens/JobSwipe';
import SendLikedJobs from './screens/SendLikedJobs';
import EditFriends from './screens/EditFriends';
import EditSkills from './screens/EditSkills';

import { appStyles } from './styles';


export default class App extends React.Component {
  async componentDidMount() {
    if (Platform.OS === 'android') {
      try {
        await firebase.messaging().requestPermission();
        const fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
          logger.log('FCM Token: ', fcmToken);
          global.firebaseToken = fcmToken;
          const enabled = await firebase.messaging().hasPermission();
          if (enabled) {
            logger.log(`FCM messaging has permission:${enabled}`);
          } else {
            try {
              await firebase.messaging().requestPermission();
              logger.log('FCM permission granted');
            } catch (error) {
              logger.log('FCM Permission Error', error);
            }
          }
          this.createNotificationListeners();
        } else {
          logger.log('FCM Token not available');
        }
      } catch (e) {
        logger.log('Error initializing FCM', e);
      }
    }
  }

  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  showAlert = (title, body) => {
    Alert.alert(
      title, body,
      [
        { text: 'OK', onPress: () => logger.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }

  createNotificationListeners = async () => {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
      this.showAlert(title, body);
    });
  }

  render() {
    return (
      <AppContainer
        styles={appStyles.containerStyle}
      />
    );
  }
}

const navConfig = {
  headerMode: 'none',
  navigationOptions: {
    headerVisible: false,
  },
};

const drawerNavConfig = {
  initialRouteName: 'JobSwipe',
  navigationOptions: {
    headerVisible: false,
  },
};

const AppStack = createDrawerNavigator(
  {
    JobSwipe,
    SendLikedJobs,
    EditFriends,
    EditSkills,
  },
  drawerNavConfig,
);

const AuthStack = createStackNavigator(
  {
    SignIn,
    SignUp,
  },
  navConfig,
);

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      App: AppStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'Auth',
    },
  ),
);
