import React, { Component } from 'react';
import { View, TouchableOpacity, Text, TextInput, Image, StyleSheet } from 'react-native';
import  { Button, NavHeader } from '../components';
import { images, colours, fonts } from '../constants'
import FilePickerManager from 'react-native-file-picker';

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
    FilePickerManager.showFilePicker(null, (response) => {
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
      
        var body = new FormData();
        body.append('authToken', 'secret');
        body.append('photo', photo);
        body.append('title', 'A beautiful photo!');
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://3.16.169.130:8080/jobs/javascript');
        xhr.send(body);

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
            onPress={this.onPressUpload.bind(this)}
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




 