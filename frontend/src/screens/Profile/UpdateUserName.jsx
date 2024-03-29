import React, { Component } from 'react';
import {
  View, Text, TextInput,
} from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import ErrorDisplay from '../../components/ErrorDisplay';
import Button from '../../components/Button';
import NavHeader from '../../components/NavHeader/NavHeader';
import config from '../../constants/config';
import { errors } from '../../constants/messages';
import styles from './styles';
import { colours } from '../../styles';

export default class UpdateUserName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      invalidUserName: false,
      blank: false,
      showErrorDisplay: false,
      errorDisplayText: errors.default,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  onPressUpdate = async () => {
    const { navigation } = this.props;
    const { userName } = this.state;
    const { userId } = global;
    if (userName.length === 0) {
      this.setState({ blank: true });
      return;
    }
    this.setState({ blank: false });

    try {
      this.logger.info(global.userId);
      await axios.put(`${config.ENDP_UPDATE_USERNAME}${userId}`, {
        userName,
      });
      navigation.goBack();
    } catch (e) {
      if (!e.response || e.response.data.status !== 400) {
        this.setState({
          showErrorDisplay: true,
          errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
        });
      } else {
        this.setState({ invalidUserName: true });
      }
    }
  }

  render() {
    const { navigation } = this.props;
    const {
      userName, invalidUserName, blank, showErrorDisplay, errorDisplayText,
    } = this.state;
    return (
      <View style={styles.container}>
        <NavHeader
          title="Update Username"
          leftButtonOption="back"
          onPressLeftButton={() => navigation.goBack()}
        />
        <ErrorDisplay
          showDisplay={showErrorDisplay}
          setShowDisplay={show => this.setState({ showErrorDisplay: show })}
          displayText={errorDisplayText}
          style={styles.errorDisplay}
        />
        <Text style={styles.text}>
          Enter a new username
        </Text>
        <TextInput
          style={styles.inputContainer}
          placeholder="New Username"
          value={userName}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ userName: text, invalidUserName: false }); }}
        />
        {invalidUserName
          ? <Text style={styles.warning}>{`Username "${userName}" already taken`}</Text>
          : <Text />}
        <Button
          backgroundColor={colours.accentPrimary}
          title="Update Username"
          textColor={colours.white}
          style={styles.button}
          onPress={() => this.onPressUpdate()}
        />
        {blank ? <Text style={styles.warning}>Fields must not be blank</Text>
          : <Text />}
      </View>
    );
  }
}
