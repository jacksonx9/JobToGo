import React, { Component } from 'react';
import {
  View, Image, Text, TouchableOpacity, Modal,
} from 'react-native';
import FilePickerManager from 'react-native-file-picker';
import { CameraKitCamera, CameraKitCameraScreen } from 'react-native-camera-kit';
import axios from 'axios';
import Logger from 'js-logger';
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/Feather';

import Loader from '../../components/Loader';
import ErrorDisplay from '../../components/ErrorDisplay';
import NavHeader from '../../components/NavHeader/NavHeader';
import config from '../../constants/config';
import styles from './styles';
import images from '../../constants/images';
import { errors, status } from '../../constants/messages';
import { colours } from '../../styles';
import icons from '../../constants/icons';

export default class EditSkills extends Component {
  constructor(props) {
    super(props);
    this.logger = Logger.get(this.constructor.name);

    this.state = {
      showErrorDisplay: false,
      errorDisplayText: errors.default,
      cameraVisible: false,
      loading: false,
    };
  }

  async componentDidMount() {
    const cameraAuthorized = await CameraKitCamera.checkDeviceCameraAuthorizationStatus();
    if (cameraAuthorized === -1 || cameraAuthorized === 0) {
      await CameraKitCamera.requestDeviceCameraAuthorization();
    }
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

        try {
          await axios.post(`${config.ENDP_RESUME}`,
            data, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          Toast.show(status.resumeUploaded);
        } catch (e) {
          this.setState({
            showErrorDisplay: true,
            errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
          });
        }
      }
    });
  }

  onTakePicture = () => {
    this.setState({
      cameraVisible: true,
    });
  }

  handleBottomButtonPressed = async event => {
    if (event.type === 'left') {
      this.setState({ cameraVisible: false });
    } else if (event.type === 'capture') {
      const { image } = event;

      const data = new FormData();
      data.append('userId', global.userId);
      data.append('resume', {
        uri: `file://${image.uri}`,
        type: 'image/jpg',
        name: image.name,
      });

      try {
        this.setState({
          cameraVisible: false,
          loading: true,
        });

        await axios.post(`${config.ENDP_RESUME}`,
          data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

        this.setState({
          loading: false,
        });
        Toast.show(status.resumeUploaded);
      } catch (e) {
        this.setState({
          loading: false,
          showErrorDisplay: true,
          errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
        });
      }
    }
  }

  render() {
    const { navigation } = this.props;
    const {
      showErrorDisplay, errorDisplayText, cameraVisible, loading,
    } = this.state;

    if (loading) return <Loader />;

    return (
      <View style={styles.container} testID="editSkills">
        <Modal visible={cameraVisible}>
          <CameraKitCameraScreen
            actions={{ leftButtonText: 'Cancel' }}
            flashImages={{
              on: images.iconFlashOn,
              off: images.iconFlashOff,
              auto: images.iconFlashAuto,
            }}
            cameraFlipImage={images.iconCameraFlip}
            captureButtonImage={images.iconCameraButton}
            onBottomButtonPressed={event => this.handleBottomButtonPressed(event)}
          />
        </Modal>
        <NavHeader
          testID="navHeaderSkills"
          title="Edit Skills"
          rightButtonOption="menu"
          onPressRightButton={() => navigation.openDrawer()}
        />
        <ErrorDisplay
          showDisplay={showErrorDisplay}
          setShowDisplay={show => this.setState({ showErrorDisplay: show })}
          displayText={errorDisplayText}
        />
        <Image
          testID="checkingDoc"
          source={images.checkingDoc}
          style={styles.image}
        />
        <Text style={styles.text} testID="textSkills">
          Get jobs that are tailored to your skills by uploading your resume.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonSection}
            testID="uploadResume"
            onPress={() => this.onPressUpload()}
          >
            <Icon
              name={icons.upload}
              color={colours.white}
              size={icons.lg}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonSection}
            testID="takePicture"
            onPress={() => this.onTakePicture()}
          >
            <Icon
              name={icons.camera}
              color={colours.white}
              size={icons.lg}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
