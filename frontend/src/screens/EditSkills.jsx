import React, { Component } from 'react';
import { View } from 'react-native';
import FilePickerManager from 'react-native-file-picker';
import axios from 'axios';
import Logger from 'js-logger';

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
