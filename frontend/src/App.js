import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import JobSwipe from './screens/JobSwipe';
import SendLikedJobs from './screens/SendLikedJobs';

export default class App extends React.Component {
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

const AppStack = createStackNavigator({ JobSwipe: SendLikedJobs }, navConfig);
const AuthStack = createStackNavigator({ SignIn: SignIn, SignUp: SignUp }, navConfig);

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