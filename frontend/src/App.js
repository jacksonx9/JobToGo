/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */



import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import JobSwipe from './screens/JobSwipe';


export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}

const navConfig = {
  headerMode: 'none',
  navigationOptions: {
    headerVisible: false,
  }
}

const AppStack = createStackNavigator({ JobSwipe: JobSwipe }, navConfig);
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});