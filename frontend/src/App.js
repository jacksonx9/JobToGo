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

import { AsyncStorage } from 'react-native';
import firebase from 'react-native-firebase';


export default class App extends React.Component {

  async componentDidMount() {
    if (Platform.OS === 'android') {
      try {
        console.log("!!!!!!!")
        const res = await firebase.messaging().requestPermission();
        const fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
          console.log('FCM Token: ', fcmToken);
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
          firebase.notifications().onNotificationDisplayed((notification: Notification) => {
            // Process your notification as required
            // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
            console.log('Notification: ', notification)
          });
          this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
            console.log('Notification: ', notification)
          });
        } else {
          console.log('FCM Token not available');
        }
      } catch (e) {
        console.log('Error initializing FCM', e);
      }
    }
  }

  // async checkPermission() {
  //   const enabled = await firebase.messaging().hasPermission();
  //   if (enabled) {
  //       this.getToken();
  //   } else {
  //       this.requestPermission();
  //   }
  // }
  
  //   //3
  // async getToken() {
  //   let fcmToken = await AsyncStorage.getItem('fcmToken');
  //   if (!fcmToken) {
  //       fcmToken = await firebase.messaging().getToken();
  //       if (fcmToken) {
  //           // user has a device token
  //           await AsyncStorage.setItem('fcmToken', fcmToken);
  //       }
  //   }
  //   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  //   console.log(fcm)
  // }
  
  //   //2
  // async requestPermission() {
  //   try {
  //       await firebase.messaging().requestPermission();
  //       // User has authorised
  //       this.getToken();
  //   } catch (error) {
  //       // User has rejected permissions
  //       console.log('permission rejected');
  //   }
  // }

  render() {
    return <AppContainer styles={styles.containerStyle} />;
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