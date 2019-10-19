import React, { Component } from 'react';
import { View, TouchableOpacity, Text, TextInput, Image, StyleSheet } from 'react-native';
import { Button } from '../components';
import { images, colours, fonts } from '../constants'

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

  render() {
    return (
      <View style={[styles.containerStyle]}>
        <View style={[styles.formStyle]}>
          <Image 
            source={images.logoDark}
            style={[styles.imageStyle]}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder={'Email'}
            value={this.state.email}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({email: text})}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder={'Password'}
            value={this.state.password}
            secureTextEntry={true}
            placeholderTextColor={colours.lightBlue}
            onChangeText={(text) => this.setState({passowrd: text})}
          />
          
          <Button
            backgroundColor={'#E6E6E6'}
            textColor={'#1F1E1F'}
            title={'Sign In'}
            textColor={colours.blue}
            backgroundColor='white'
            style={[styles.buttonStyle]}
            onPress={this.onPressSignIn.bind(this)}
          />
          <TouchableOpacity
            style={[styles.linkStyle]}
            onPress={() => {this.props.navigation.navigate('SignUp')}}
          >
            <Text style={[styles.textStyle]}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.linkStyle]}
            onPress={() => {this.props.navigation.navigate('SignUp')}}
          >
            <Text style={[styles.textStyle]}>Forgot Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
};


const styles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.blue
  },
  formStyle: {
    paddingTop: 100,
    height: '100%',
    width: '80%',
    position: 'absolute'
  },
  imageStyle: {
    height: 100,
    width: '100%',
    marginBottom: 40
  },
  inputStyle: {
    height: 50,
    width: '100%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'white',
    backgroundColor: colours.darkBlue,
    fontFamily: fonts.normal,
  },
  buttonStyle: {
    marginTop: 5,
    marginBottom: 20
  },
  linkStyle: {
    alignItems: 'center'
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white'
  }
});
 