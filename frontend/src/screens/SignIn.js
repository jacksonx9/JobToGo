import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, InputText } from '../components';

export default class SignIn extends Component {
  onPressSignIn = () => {
    this.props.navigation.navigate('App')
  }
  onPressSignUpRedirect = () => {
    this.props.navigation.navigate('SignUp')
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        
        <View style={styles.formStyle}>
            <InputText
              style={styles.inputStyle}
              title={'Email'}
              value={'this.props.name'}
              onChangeText={console.log('hi')}
            />

            <InputText
              style={styles.inputStyle}
              title={'Password'}
              value={'this.props.name'}
              onChangeText={console.log('hi')}
            />
        </View>
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


const margin = 14;
const styles = StyleSheet.create({
  containerStyle: {
    flex: 1
  },
  imageButtonStyle: {
    position: 'absolute',
    bottom: 10,
    right: 10
  },

  formStyle: {
    margin: margin,
  },
  subFormStyle: {
    flexDirection: 'row',
    marginBottom: margin
  },
  inputStyle: {
    flex: 1,
  },
  spaceViewStyle: {
    margin: margin / 2
  }
});
 