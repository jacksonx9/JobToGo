
import React, { Component } from 'react';
import { View } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import axios from 'axios';
import Logger from 'js-logger';

import JobImage from '../components/JobImage';
import JobDetails from '../components/JobDetails';
import Loader from '../components/Loader';
import MainHeader from '../components/MainHeader';
import config from '../constants/config';
import { jobSwipeStyles } from '../styles';

const COMPANY_API_ENDPT = 'https://autocomplete.clearbit.com/v1/companies/suggest?query=';
const LOGO_SIZE = 200;
const styles = jobSwipeStyles;
export default class JobSwipe extends Component {
  static navigationOptions = {
    drawerLabel: 'Job Swipe',
  }

  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      jobIndex: 0,
      loading: 1,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
    const { userId } = global;
    this.logger.info(`User id is: ${userId}`);
    this.fetchJobs(userId);
  }

  fetchJobs = async userId => {
    this.setState({
      loading: 1,
    });

    try {
      const jobsResp = await axios.get(`${config.ENDP_JOBS}${userId}`);
      const jobs = jobsResp.data.result;

      await Promise.all(jobs.map(async (job, i) => {
        const companyInfoResp = await fetch(
          `${COMPANY_API_ENDPT}${job.company}`,
        );
        const companyInfo = await companyInfoResp.json();

        if (companyInfo[0] !== undefined) {
          jobs[i].logo = `${companyInfo[0].logo}?size=${LOGO_SIZE}`;
        } else {
          jobs[i].logo = null;
        }
      })).then(() => this.setState({
        loading: 0,
        jobs,
      }));
    } catch (error) {
      this.logger.error(error);
    }
  }

  shareJob = () => {
    this.logger.info('Shared job');
  }

  getNextJob = (jobNum, jobIndex, userId) => {
    if (jobNum === (jobIndex + 1)) {
      this.fetchJobs(userId);
    } else {
      this.setState({ jobIndex: jobIndex + 1 });
    }
  }

  dislikeJob = async (jobs, jobIndex) => {
    const { userId } = global;
    await axios.post(`${config.ENDP_DISLIKE}`, {
      userId,
      jobId: jobs[jobIndex]._id,
    }).catch(e => this.logger.error(e));

    this.getNextJob(jobs.length, jobIndex, userId);
  }

  likeJob = async (jobs, jobIndex) => {
    const { userId } = global;
    await axios.post(`${config.ENDP_LIKE}`, {
      userId,
      jobId: jobs[jobIndex]._id,
    }).catch(e => this.logger.error(e));

    this.getNextJob(jobs.length, jobIndex, userId);
  }

  render() {
    const { loading, jobs, jobIndex } = this.state;
    const { navigation } = this.props;
    const job = jobs[jobIndex];
    const gestureConfig = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };

    if (loading) return <Loader />;

    return (
      <View style={[styles.container]}>
        <MainHeader
          onPressMenu={() => navigation.openDrawer()}
          onPressSend={() => navigation.navigate('SendLikedJobs')}
        />

        <GestureRecognizer
          onSwipeUp={this.shareJob}
          onSwipeLeft={() => this.dislikeJob(jobs, jobIndex)}
          onSwipeRight={() => this.likeJob(jobs, jobIndex)}
          config={gestureConfig}
        >
          <JobImage
            logo={job.logo}
          />
        </GestureRecognizer>

        <JobDetails
          company={job.company}
          title={job.title}
          location={job.location}
          description={job.description}
        />
      </View>
    );
  }
}
