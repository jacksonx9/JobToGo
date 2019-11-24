import React, { Component } from 'react';
import { View, FlatList, Text } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import { TextInput } from 'react-native-gesture-handler';
import SelectableItem from '../../components/SelectableItem';
import Loader from '../../components/Loader';
import NavHeader from '../../components/NavHeader';
import Button from '../../components/Button';
import config from '../../constants/config';
import icons from '../../constants/icons';
import styles from './styles';
import { colours } from '../../styles';

export default class KeywordList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keywords: [],
      newSkill: '',
      loading: 1,
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
        loading: 0,
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  addKeyword = async () => {
    const { keywords, newSkill } = this.state;
    const { userId } = global;

    try {
      await axios.post(config.ENDP_KEYWORDS, {
        userId,
        newSkill,
      });

      const updatedKeywords = [...keywords];
      updatedKeywords.push(newSkill);
      this.setState({ keywords: updatedKeywords });
    } catch (e) {
      this.logger.error(e);
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
      this.logger.error(e);
    }
  }

  render() {
    const { loading, keywords, newSkill } = this.state;
    const { navigation } = this.props;
    if (loading) return <Loader />;

    return (
      <View style={styles.container} testID="keywords">
        <NavHeader
          testID="navHeaderKeyword"
          title="Keywords"
          leftButtonOption="back"
          onPressRightButton={() => navigation.navigate('TabStack')}
        />
        <TextInput
          testID="keywordInput"
          style={styles.inputContainer}
          placeholder="Add a Skill"
          value={newSkill}
          placeholderTextColor={colours.lightGray}
          onChangeText={text => { this.setState({ newSkill: text }); }}
        />
        <Button
          testID="submitKeyword"
          title="Add"
          textColor={colours.white}
          backgroundColor={colours.accentPrimary}
          style={styles.button}
          onPress={() => this.addKeyword()}
        />
        <View style={styles.listContainer}>
          <FlatList
            testID="keywords"
            showsVerticalScrollIndicator={false}
            data={keywords}
            keyExtractor={item => item}
            renderItem={({ item, index }) => (
              <SelectableItem
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
