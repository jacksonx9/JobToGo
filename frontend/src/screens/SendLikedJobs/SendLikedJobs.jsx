import React, { Component } from 'react';
import { View, FlatList, Text } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';
import Toast from 'react-native-simple-toast';

import ErrorDisplay from '../../components/ErrorDisplay';
import SelectableItem from '../../components/SelectableItem';
import Loader from '../../components/Loader';
import NavHeader from '../../components/NavHeader';
import Button from '../../components/Button';
import config from '../../constants/config';
import { errors, status } from '../../constants/messages';
import styles from './styles';
import { colours } from '../../styles';

export default class SendLikedJobs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      likedJobs: [],
      loading: true,
      showErrorDisplay: false,
      errorDisplayText: errors.default,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
    const { navigation } = this.props;
    this.fetchLikedJobs();
    navigation.addListener('willFocus', () => this.fetchLikedJobs());
  }

  fetchLikedJobs = async () => {
    const { userId } = global;
    let likedJobs;

    try {
      const likedJobsResp = await axios.get(`${config.ENDP_LIKE}${userId}`);
      likedJobs = likedJobsResp.data.result;
    } catch (e) {
      this.setState({
        loading: false,
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
      return;
    }

    // Get the logo url of each company
    await Promise.all(likedJobs.map(async (job, i) => {
      try {
        const companyInfoResp = await axios.get(
          `${config.ENDP_COMPANY_API}${job.company}`,
        );
        const companyInfo = companyInfoResp.data[0];
        if (companyInfo) {
          likedJobs[i].logo = `${companyInfo.logo}?size=${80}`;
        } else {
          likedJobs[i].logo = null;
        }
      } catch (e) {
        likedJobs[i].logo = null;
      }
    }));

    this.setState({
      likedJobs,
      loading: false,
    });
  }

  sendLikedJobs = async () => {
    const { userId } = global;
    try {
      await axios.post(`${config.ENDP_EMAIL}`,
        {
          userId,
        });

      await axios.delete(config.ENDP_JOBS_ALL, {
        data: {
          userId,
        },
      });

      this.setState({
        likedJobs: [],
        loading: false,
      });

      Toast.show(status.emailSent);
    } catch (e) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  removeLikedJob = async (item, index) => {
    const { likedJobs } = this.state;
    const { userId } = global;

    try {
      await axios.delete(config.ENDP_JOBS, {
        data: {
          userId,
          jobId: item._id,
        },
      });

      const updatedLikedJobs = [...likedJobs];
      updatedLikedJobs.splice(index, 1);
      this.setState({ likedJobs: updatedLikedJobs });

      this.logger.info(`Removed ${item.company}: ${index} from liked jobs`);
    } catch (e) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  render() {
    const {
      loading, likedJobs, showErrorDisplay, errorDisplayText,
    } = this.state;
    const { navigation } = this.props;
    if (loading) return <Loader />;

    return (
      <View style={styles.container} testID="sendLikedJobs">
        <NavHeader
          testID="navHeaderLiked"
          title="Liked Jobs"
          rightButtonOption="menu"
          onPressRightButton={() => navigation.navigate('Profile')}
        />
        <ErrorDisplay
          showDisplay={showErrorDisplay}
          setShowDisplay={show => this.setState({ showErrorDisplay: show })}
          displayText={errorDisplayText}
        />
        <View style={styles.buttonSection}>
          <View style={styles.infoContainer}>
            <Text style={styles.bigText}>
              {`${likedJobs.length} jobs`}
            </Text>
            <Text style={styles.normalText}>
            are ready to be emailed
            </Text>
          </View>
          <View styles={[styles.buttonContainer]}>
            <Button
              testID="sendJobs"
              textColor={colours.white}
              backgroundColor={colours.accentPrimary}
              title="Send Jobs"
              style={[styles.button]}
              onPress={this.sendLikedJobs}
            />
          </View>
        </View>
        <View style={styles.listContainer}>
          <FlatList
            testID="likedJobs"
            showsVerticalScrollIndicator={false}
            data={likedJobs}
            keyExtractor={item => item._id}
            renderItem={({ item, index }) => (
              <SelectableItem
                testID={`jobItem${index}`}
                key={item._id}
                header={item.company}
                subHeader={item.title}
                onPress={() => this.removeLikedJob(item, index)}
                actionIcon="x"
                imageSource={item.logo}
              />
            )}
          />
        </View>
      </View>
    );
  }
}
