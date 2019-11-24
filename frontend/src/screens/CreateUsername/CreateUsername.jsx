import React, { Component } from 'react';
import {
  View, Image, TextInput, Text,
} from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import Button from '../../components/Button';
import config from '../../constants/config';
import images from '../../constants/images';
import { colours } from '../../styles';
import styles from './styles';


export default class CreateUsername extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      invalidUserName: false,
      emptyField: false,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  onPressConfirm = async () => {
    const { userName } = this.state;
    const { navigation } = this.props;
    if (userName.length === 0) {
      this.setState({ emptyField: true });
      return;
    }
    this.setState({ emptyField: false });

    try {
      const ret = await axios.post(`${config.ENDP_USERS}`,
        {
          userData: {
            credentials: {
              email: global.newId.credentials.email,
              idToken: global.newId.credentials.idToken,
              firebaseToken: global.newId.credentials.firebaseToken,
              userName,
            },
          },
        });
      global.userId = ret.data.result;
      navigation.navigate('App');
    } catch (e) {
      if (e.response.data.result === 'userName') {
        this.setState({
          invalidUserName: true,
        });
      } else {
        this.logger.error(e);
      }
    }
  }

  render() {
    const { userName, invalidUserName, emptyField } = this.state;
    return (
      <View style={styles.container}>
        <Image
          source={images.logoLight}
          style={styles.logo}
        />
        <Image
          source={images.jobSeeker}
          style={styles.image}
        />
        <TextInput
          style={styles.inputContainer}
          placeholder="Username"
          value={userName}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ userName: text, invalidUserName: false }); }}
        />
        <Text style={styles.warning}>{invalidUserName ? `Username "${userName}" already taken` : ''}</Text>
        <Button
          title="Confirm Username"
          textColor={colours.white}
          backgroundColor={colours.accentPrimary}
          style={styles.button}
          onPress={this.onPressConfirm}
        />
        <Text style={styles.warning}>{emptyField ? 'Fields must not be empty' : ''}</Text>
      </View>
    );
  }
}
