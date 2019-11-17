import React from 'react';
import { Platform, Alert } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/Feather';
import firebase from 'react-native-firebase';
import Logger from 'js-logger';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp/SignUp';
import AuthLanding from './screens/AuthLanding';
import JobSwipe from './screens/JobSwipe';
import SendLikedJobs from './screens/SendLikedJobs/SendLikedJobs';
import EditFriends from './screens/EditFriends/EditFriends';
import EditSkills from './screens/EditSkills/EditSkills';
import { colours, fonts, sizes } from './styles';

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
        styles={[{ flex: 1 }]}
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

const AppStack = createBottomTabNavigator(
  {
    Home: {
      screen: JobSwipe,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="home" color={tintColor} size={sizes.icon} />
        ),
      },
    },
    Send: {
      screen: SendLikedJobs,
      navigationOptions: {
        tabBarLabel: 'Liked',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="heart" color={tintColor} size={sizes.icon} />
        ),
      },
    },
    Friends: {
      screen: EditFriends,
      navigationOptions: {
        tabBarLabel: 'Friends',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="users" color={tintColor} size={sizes.icon} />
        ),
      },
    },
    Resume: {
      screen: EditSkills,
      navigationOptions: {
        tabBarLabel: 'Resume',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="upload" color={tintColor} size={sizes.icon} />
        ),
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
