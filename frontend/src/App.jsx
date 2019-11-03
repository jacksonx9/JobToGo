import React from 'react';
import { Platform, Alert } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import firebase from 'react-native-firebase';
import Logger from 'js-logger';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import JobSwipe from './screens/JobSwipe';
import SendLikedJobs from './screens/SendLikedJobs';
import EditFriends from './screens/EditFriends';
import EditSkills from './screens/EditSkills';

import { appStyles } from './styles';

const styles = appStyles;
export default class App extends React.Component {
  constructor(props) {
    super(props);
    Logger.useDefaults();
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
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
    return (
      <AppContainer
        styles={styles.container}
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
