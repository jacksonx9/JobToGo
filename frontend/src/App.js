import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Animated from 'react-native-reanimated';
import { createDrawerNavigator } from 'react-navigation-drawer';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import JobSwipe from './screens/JobSwipe';
import SendLikedJobs from './screens/SendLikedJobs';
import EditFriends from './screens/EditFriends';
import EditSkills from './screens/EditSkills';

import firebase from 'react-native-firebase';


export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      firebaseToken: ''
    };
  }

  async componentDidMount() {
    if (Platform.OS === 'android') {
      try {
        console.log("!!!!!!!")
        const res = await firebase.messaging().requestPermission();
        const fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
          console.log('FCM Token: ', fcmToken);
          this.setState({firebaseToken: fcmToken});
          const enabled = await firebase.messaging().hasPermission();
          if (enabled) {
            console.log('FCM messaging has permission:' + enabled)
          } else {
            try {
              await firebase.messaging().requestPermission();
              console.log('FCM permission granted')
            } catch (error) {
              console.log('FCM Permission Error', error);
            }
          }
        this.createNotificationListeners();
        } else {
          console.log('FCM Token not available');
        }
      } catch (e) {
        console.log('Error initializing FCM', e);
      }
    }
  }

  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  async createNotificationListeners() {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
        const { title, body } = notification;
        console.log('first')
        this.showAlert(title, body);
    });
  
    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
        const { title, body } = notificationOpen.notification;
        console.log('second')
    });
  
    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
        const { title, body } = notificationOpen.notification;
        console.log('third')
    }
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
    });
  }
  
  showAlert(title, body) {
    alert(
      title, body,
      [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }

  render() {
    console.disableYellowBox = true; 
    return <AppContainer 
      styles={styles.containerStyle} 
      screenProps={{ firebaseToken: this.state.firebaseToken }}
      />;
  } 
}

const navConfig = {
  headerMode: 'none',
  navigationOptions: {
    headerVisible: false,
  }
}

const drawerNavConfig = {
  initialRouteName: 'JobSwipe',
  navigationOptions: {
    headerVisible: false,
  }
}

const AppStack = 
createDrawerNavigator(
    { 
      JobSwipe: JobSwipe, 
      SendLikedJobs: SendLikedJobs,
      EditFriends: EditFriends,
      EditSkills: EditSkills
    }, 
    drawerNavConfig
  );
const AuthStack = 
  createStackNavigator(
    { 
      SignIn: SignIn, 
      SignUp: SignUp 
    }, 
    navConfig
  );

AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      //AuthLoading: AuthLoadingScreen,
      App: AppStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'Auth',
    }
  )
);

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});