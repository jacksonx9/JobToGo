import React, { Component } from 'react';
import { View } from 'react-native';
import FilePickerManager from 'react-native-file-picker';
import axios from 'axios';
import { logger } from 'react-native-logger';

import Button from '../components/Button';
import NavHeader from '../components/NavHeader';
import images from '../constants/images';
import config from '../constants/config';
import { containerStyles, editSkillsStyles } from '../styles';

const styles = { ...containerStyles, ...editSkillsStyles };
export default class EditSkills extends Component {
  static navigationOptions = {
    drawerLabel: 'Edit Skills',
  }

  onPressUpload = () => {
    FilePickerManager.showFilePicker(null, async (response) => {
      logger.log('Response = ', response);

      if (response.didCancel) {
        logger.log('User cancelled file picker');
      } else if (response.error) {
        logger.log('FilePickerManager Error: ', response.error);
      } else {
        const data = new FormData();
        data.append('userId', global.userId);
        data.append('resume', {
          uri: response.uri,
          type: response.type,
          name: response.fileName,
        });

        await axios.post(`${config.ENDP_RESUME}`,
          data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }).catch((e) => logger.log(e));
      }
    });
  }


  render() {
    const { navigation } = this.props;
    return (
      <View style={[styles.flexColAlignCenterContainer]}>
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
          style={[styles.button]}
          onPress={() => this.onPressUpload()}
        />
      </View>
    );
  }
}
