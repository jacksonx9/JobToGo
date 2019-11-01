
import React, { Component } from 'react';
import { View } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import axios from 'axios';

import JobImage from '../components/JobImage';
import JobDetails from '../components/JobDetails';
import Loader from '../components/Loader';
import MainHeader from '../components/MainHeader';
import config from '../constants/config';
import { jobSwipeStyles } from '../styles';


const styles = jobSwipeStyles;
export default class JobSwipe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      jobIndex: 0,
      loading: 1,
    };
  }

  async componentDidMount() {
    const { userId } = global;
    console.log(`User id is: ${userId}`);
    this.fetchJobs(userId);
  }

  fetchJobs = async (userId) => {
    this.setState({
      loading: 1,
    });

    const jobs = await axios.get(`${config.ENDP_JOBS}${userId}`)
      .catch((e) => console.log(e));

    this.setState({
      jobs: jobs.data.result,
      loading: 0,
    });
  }

  shareJob = () => {
    console.log('Shared job');
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
    }).catch((e) => console.log(e));

    this.getNextJob(jobs.length, jobIndex, userId);
  }

  likeJob = async (jobs, jobIndex) => {
    const { userId } = global;
    await axios.post(`${config.ENDP_LIKE}`, {
      userId,
      jobId: jobs[jobIndex]._id,
    }).catch((e) => console.log(e));

    this.getNextJob(jobs.length, jobIndex, userId);
  }

  static navigationOptions = {
    drawerLabel: 'Job Swipe',
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
            company={job.company}
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
