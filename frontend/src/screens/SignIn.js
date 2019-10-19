import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from '../components';

export default class SignIn extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      passowrd: ''
    };
  }

  onPressSignIn = () => {
    this.props.navigation.navigate('App')
  }
  onPressSignUpRedirect = () => {
    this.props.navigation.navigate('SignUp')
  }

  render() {
    return (
      <View style={[styles.containerStyle]}>
        
        <TextInput
          style={styles.inputStyle}
          placeholder={'Email'}
          value={this.state.email}
          onChangeText={(text) => this.setState({email: text})}
        />
        <TextInput
          style={styles.inputStyle}
          placeholder={'Password'}
          value={this.state.password}
          onChangeText={(text) => this.setState({passowrd: text})}
        />
        
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
    );
  };
};



const styles = StyleSheet.create({
  containerStyle: {
    height: 100 + '%',
    width: 100 + '%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
 