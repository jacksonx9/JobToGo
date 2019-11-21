import React, { Component } from 'react';
import {
  View, Image, Text, TextInput,
} from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import Button from '../../components/Button';
import NavHeader from '../../components/NavHeader/NavHeader';
import config from '../../constants/config';
import styles from './styles';
import { colours } from '../../styles';
import images from '../../constants/images';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      invalidUserName: false,
      blank: false,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  onPressUpdate = () => {
    const { userName } = this.state;
    if (userName.length === 0) {
      this.setState({ blank: true });
      return;
    }
    this.setState({ blank: false });
    axios.post(`${config.ENDP_UPDATE_USERNAME}`, {
      userId: global.userId,
      userName,
    }).catch(this.setState({ invalidUserName: true }));
  }

  render() {
    const { navigation } = this.props;
    const { userName, invalidUserName, blank } = this.state;
    return (
      <View style={styles.container}>
        <NavHeader
          title="Update Username"
        />
        <Image
          source={images.checkingDoc}
          style={styles.image}
        />
        <Text style={styles.text}>
          Change your account settings
        </Text>
        <TextInput
          style={styles.inputContainer}
          placeholder="New Username"
          value={userName}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ userName: text, invalidUserName: false }); }}
        />
        {invalidUserName ? <Text>{`Username "${userName}" already taken`}</Text>
          : <Text />}
        <Button
          backgroundColor={colours.accentPrimary}
          title="Update Username"
          textColor={colours.white}
          style={styles.button}
          onPress={() => this.onPressUpdate()}
        />
        {blank ? <Text>Fields must not be blank</Text>
          : <Text />}
      </View>
    );
  }
}
