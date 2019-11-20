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
      username: '',
      invalidUsername: false,
      blank: false,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  onPressConfirm = async () => {
    const { username } = this.state;
    const { navigation } = this.props;
    if (username.length === 0) {
      this.setState({ blank: true });
      return;
    }
    this.setState({ blank: false });

    // // see if username is taken
    // const ret = await axios.post(`${config.ENDP_USERS}`,
    //   {
    //     credentials: {
    //       email: global.newId.email,
    //       idToken: global.newId.idToken,
    //       firebaseToken: global.newId.firebaseToken,
    //       username,
    //     },
    //   }).catch(e => this.logger(e));

    // if (ret.data.status !== '400') {
    //   global.userId = ret.data.result;
    //   navigation.navigate('App');
    // } else {
    //   this.setState({ invalidUsername: true });
    // }
    this.setState({ invalidUsername: true });
  }

  render() {
    const { username, invalidUsername, blank } = this.state;
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
          value={username}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ username: text, invalidUsername: false }); }}
        />
        {invalidUsername ? <Text>{`Username "${username}" already taken`}</Text>
          : <Text />}
        <Button
          title="Confirm Username"
          textColor={colours.white}
          backgroundColor={colours.accentPrimary}
          style={styles.button}
          onPress={this.onPressConfirm}
        />
        {blank ? <Text>Fields must not be blank</Text>
          : <Text />}

      </View>
    );
  }
}
