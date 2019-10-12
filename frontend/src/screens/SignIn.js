import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Button } from '../components';

export default class SignIn extends Component {
  onPressSignIn() {
    this.props.navigation.navigate('App')
  }
  onPressSignUpRedirect() {
    this.props.navigation.navigate('SignUp')
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
        backgroundColor={'#E6E6E6'}
        textColor={'#1F1E1F'}
        title={'Sign In'}
        onPress={this.onPressSignIn.bind(this)}
        />
        <Button
        backgroundColor={'#E6E6E6'}
        textColor={'#1F1E1F'}
        title={'Sign Up'}
        onPress={this.onPressSignUpRedirect.bind(this)}
        />
      </View>
    )
  }
}
 