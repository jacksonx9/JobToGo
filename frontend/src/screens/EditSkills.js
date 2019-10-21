import React, { Component } from 'react';
import { View, TouchableOpacity, Text, TextInput, Image, StyleSheet } from 'react-native';
import  { Button, NavHeader } from '../components';
import { images, colours, fonts } from '../constants'
import FilePickerManager from 'react-native-file-picker';
import axios from 'axios';

export default class EditSkills extends Component {
  
  static navigationOptions = {
      drawerLabel: 'Edit Skills',
  };

  constructor(props) {
    super(props);
    this.state = {
      likedJobs: [],
      resumeFile: '',
      uploaded: false
    };
  }

  onPressUpload = () => {
    console.log('from resume')
    console.log(this.props.navigation.state.params.userId)
    FilePickerManager.showFilePicker(null, async (response) => {
      console.log('Response = ', response);
     
      if (response.didCancel) {
        console.log('User cancelled file picker');
      }
      else if (response.error) {
        console.log('FilePickerManager Error: ', response.error);
      }
      else {
        var photo = {
          uri: response.uri,
          type: response.type,
          name: response.fileName,
      };

      const res = await axios.post('http://128.189.26.177:8080/users/resume/upload', 
      {
        userId: this.props.navigation.state.params.userId,
        authToken: 'secret',
        photo,
        title: 'A beautiful photo!'
      }).catch(e => console.log(e));
      
        // var body = new FormData();
        // body.append('authToken', 'secret');
        // body.append('photo', photo);
        // body.append('title', 'A beautiful photo!');
        
        // var xhr = new XMLHttpRequest();
        // xhr.open('POST', 'http://10.231.110.76:8080/user/resume/upload');
        // xhr.send(body);

        alert("hi")
      }
    });
  }



  render() {
    return (
      <View style={[styles.containerStyle]}>
        <NavHeader
            title='Edit Skills'
            image={images.iconSend}
            onPressBack={() => this.props.navigation.goBack()}
            onPressBtn={() => this.props.navigation.navigate('SendLikedJobs')}
        />
        
          
          <Button
            backgroundColor={'#E6E6E6'}
            textColor={'#1F1E1F'}
            title={'Upload Resume'}
            textColor={colours.blue}
            backgroundColor='white'
            style={[styles.buttonStyle]}
            onPress={ () => this.onPressUpload()}
          />

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
    marginBottom: 20,
    width: '100%',
    height: 50
  },
  linkStyle: {
    alignItems: 'center'
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white'
  }
});




 