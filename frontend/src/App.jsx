import React from 'react';
import { Platform, Alert } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import firebase from 'react-native-firebase';
import Logger from 'js-logger';
import Icon from 'react-native-vector-icons/Ionicons';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp/SignUp';
import AuthLanding from './screens/AuthLanding';
import JobSwipe from './screens/JobSwipe';
import SendLikedJobs from './screens/SendLikedJobs/SendLikedJobs';
import EditFriends from './screens/EditFriends/EditFriends';
import EditSkills from './screens/EditSkills/EditSkills';

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
  tabBarOptions: {
    activeTintColor: 'tomato',
    inactiveTintColor: 'gray',
  },
  style: {
    backgroundColor: '#42a5f5',
  },
};

const AppStack = createBottomTabNavigator(
  {
    Home: {
      screen: JobSwipe,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ios-briefcase" color="pink" size={25} />
        ),
      },
      style: {
        backgroundColor: '#42a5f5',
      },
    },
    Send: {
      screen: SendLikedJobs,
      navigationOptions: {
        tabBarLabel: 'Profile',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ios-home" color="pink" size={25} />
        ),
      },
    },
    Friends: {
      screen: EditFriends,
      navigationOptions: {
        tabBarLabel: 'Profile',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ios-person" color="pink" size={25} />
        ),
      },
    },
    Resume: {
      screen: EditSkills,
      navigationOptions: {
        tabBarLabel: 'Profile',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ios-home" color="pink" size={25} />
        ),
      },
    },
  },
  {
    initialRouteName: 'Home',
    tabBarOptions: {
      style: {
        height: 55,
        backgroundColor: 'white',
        borderTopColor: 'transparent',
      },
    },
  },
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
