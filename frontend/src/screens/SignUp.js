import React, { Component } from 'react';
import { Button, View, Text } from 'react-native';


export default class SignUp extends Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Signup Screen</Text>
        <Button
          title="Go to About"
          onPress={() => this.props.navigation.navigate('App')}
          />
      </View>
    )
  }
}