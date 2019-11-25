import React, { Component } from 'react';
import {
  View, FlatList, Text, TextInput,
} from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';
import Toast from 'react-native-simple-toast';

import ErrorDisplay from '../../components/ErrorDisplay';
import { SelectableItemShort } from '../../components/SelectableItem';
import Loader from '../../components/Loader';
import NavHeader from '../../components/NavHeader';
import Button from '../../components/Button';
import config from '../../constants/config';
import icons from '../../constants/icons';
import { errors } from '../../constants/messages';
import styles from './styles';
import { colours } from '../../styles';

export default class KeywordList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keywords: [],
      newSkill: '',
      loading: true,
      response: '',
      showErrorDisplay: false,
      errorDisplayText: errors.default,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
    const { navigation } = this.props;
    navigation.addListener('willFocus', () => this.fetchKeywords());
  }

  fetchKeywords = async () => {
    const { userId } = global;
    try {
      const keywordResp = await axios.get(`${config.ENDP_GET_KEYWORDS}${userId}`);
      const keywords = keywordResp.data.result;

      this.setState({
        keywords,
        loading: false,
      });
    } catch (e) {
      this.setState({
        loading: false,
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  addKeyword = async () => {
    const { keywords, newSkill } = this.state;
    const { userId } = global;

    if (newSkill.length === 0) {
      this.setState({ response: 'Fields must not be empty' });
      return;
    }

    try {
      await axios.post(config.ENDP_KEYWORDS, {
        userId,
        keyword: newSkill,
      });

      const updatedKeywords = [...keywords];
      updatedKeywords.push(newSkill);
      this.setState({
        keywords: updatedKeywords, newSkill: '',
      });
      Toast.show('Successfully added Skill');
    } catch (e) {
      if (!e.response || !e.response.data
          || !e.response.data.result || e.response.data.status !== 400) {
        this.setState({
          showErrorDisplay: true,
          errorDisplayText: errors.default,
        });
      } else {
        this.setState({ response: `Skill "${newSkill}" already added` });
      }
    }
  }

  removeKeyword = async (item, index) => {
    const { keywords } = this.state;
    const { userId } = global;

    try {
      await axios.delete(config.ENDP_KEYWORDS, {
        data: {
          userId,
          keyword: keywords[index],
        },
      });

      const updatedKeywords = [...keywords];
      updatedKeywords.splice(index, 1);
      this.setState({ keywords: updatedKeywords });

      this.logger.info(`Removed ${item}: ${index} from keywords`);
    } catch (e) {
      this.setState({
        loading: false,
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  render() {
    const {
      loading, keywords, newSkill, response, showErrorDisplay, errorDisplayText,
    } = this.state;
    const { navigation } = this.props;
    if (loading) return <Loader />;

    return (
      <View style={styles.container} testID="keywords">
        <NavHeader
          testID="navHeaderKeyword"
          title="Keywords"
          leftButtonOption="back"
          onPressLeftButton={() => navigation.goBack()}
        />
        <ErrorDisplay
          showDisplay={showErrorDisplay}
          setShowDisplay={show => this.setState({ showErrorDisplay: show })}
          displayText={errorDisplayText}
          style={styles.errorDisplay}
        />
        <View style={styles.addSkillSection}>
          <TextInput
            testID="keywordInput"
            style={styles.inputContainer}
            placeholder="Add a Skill"
            value={newSkill}
            placeholderTextColor={colours.lightGray}
            onChangeText={text => {
              this.setState({
                newSkill: text, response: '',
              });
            }}
          />
          <Button
            testID="submitKeyword"
            title="Add"
            textColor={colours.white}
            backgroundColor={colours.accentPrimary}
            style={styles.button}
            onPress={() => this.addKeyword()}
          />
        </View>
        <Text style={styles.warning}>{ response }</Text>
        <View style={styles.listContainer}>
          <FlatList
            testID="keywords"
            numColumns={2}
            showsVerticalScrollIndicator={false}
            data={keywords}
            keyExtractor={item => item}
            renderItem={({ item, index }) => (
              <SelectableItemShort
                testID={`keyword${index}`}
                key={item}
                header={item}
                onPress={() => this.removeKeyword(item, index)}
                actionIcon={icons.x}
              />
            )}
          />
        </View>
      </View>
    );
  }
}
