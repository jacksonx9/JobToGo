import React, { Component } from 'react';
import { View, TouchableOpacity, Text, TextInput, Image, StyleSheet } from 'react-native';
import  { Button, NavHeader } from '../components';
import { images, colours, fonts, serverIp } from '../constants'
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
    FilePickerManager.showFilePicker(null, async (response) => {
      console.log('Response = ', response);
     
      if (response.didCancel) {
        console.log('User cancelled file picker');
      }
      else if (response.error) {
        console.log('FilePickerManager Error: ', response.error);
      }
      else {
        const data = new FormData();
        data.append('userId', this.props.navigation.dangerouslyGetParent().getParam('userId'));
        data.append('fileData', {
          uri : response.uri,
          type: response.type,
          name: response.fileName
        });

        const res = await axios.post(serverIp+'/users/resume/upload', 
        data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).catch(e => console.log(e))
      
      

        alert("Resume Sent for analysis")
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
            enableBtn={false}
        />
        
          
          <Button
            backgroundColor={'#E6E6E6'}
            title={'Upload Resume'}
            textColor={'white'}
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
    backgroundColor: 'white'
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
    marginTop: 50,
    marginBottom: 20,
    width: '50%',
    height: 70,
    backgroundColor: colours.blue
  },
  linkStyle: {
    alignItems: 'center'
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white'
  }
});




 