import React, { Component } from 'react';
import { View, Image, Text } from 'react-native';
import FilePickerManager from 'react-native-file-picker';
import axios from 'axios';
import Logger from 'js-logger';

import Button from '../../components/Button';
import NavHeader from '../../components/NavHeader/NavHeader';
import config from '../../constants/config';
import styles from './styles';
import { colours } from '../../styles';
import images from '../../constants/images';

export default class EditSkills extends Component {
  constructor(props) {
    super(props);
    this.logger = Logger.get(this.constructor.name);
  }

  onPressUpload = () => {
    FilePickerManager.showFilePicker(null, async response => {
      this.logger.info('Response = ', response);

      if (response.didCancel) {
        this.logger.warn('User cancelled file picker');
      } else if (response.error) {
        this.logger.error('FilePickerManager Error: ', response.error);
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
          }).catch(e => this.logger.error(e));
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <NavHeader
          title="Edit Skills"
        />
        <Image
          source={images.checkingDoc}
          style={styles.image}
        />
        <Text style={styles.text}>
          Get jobs that are tailored to your skills by uploading your resume.
        </Text>
        <Button
          backgroundColor={colours.accentPrimary}
          title="Upload Resume"
          textColor={colours.white}
          style={styles.button}
          onPress={() => this.onPressUpload()}
        />
      </View>
    );
  }
}
