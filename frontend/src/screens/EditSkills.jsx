import React, { Component } from 'react';
import { View } from 'react-native';
import FilePickerManager from 'react-native-file-picker';
import axios from 'axios';

import Button from '../components/Button';
import NavHeader from '../components/NavHeader';

import images from '../constants/images';
import config from '../constants/config';
import { editSkillsStyles } from '../styles';


const styles = editSkillsStyles;
export default class EditSkills extends Component {
  onPressUpload = () => {
    FilePickerManager.showFilePicker(null, async (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled file picker');
      } else if (response.error) {
        console.log('FilePickerManager Error: ', response.error);
      } else {
        const data = new FormData();
        data.append('userId', global.userId);
        data.append('fileData', {
          uri: response.uri,
          type: response.type,
          name: response.fileName,
        });

        await axios.post(`${config.serverIp}/users/resume/upload`,
          data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }).catch((e) => console.log(e));

        alert('Resume Sent for analysis');
      }
    });
  }

  static navigationOptions = {
    drawerLabel: 'Edit Skills',
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={[styles.containerStyle]}>
        <NavHeader
          title="Edit Skills"
          image={images.iconSend}
          onPressBack={() => navigation.goBack()}
          onPressBtn={() => navigation.navigate('SendLikedJobs')}
          enableBtn={false}
        />
        <Button
          backgroundColor="#E6E6E6"
          title="Upload Resume"
          textColor="white"
          style={[styles.buttonStyle]}
          onPress={() => this.onPressUpload()}
        />
      </View>
    );
  }
}
