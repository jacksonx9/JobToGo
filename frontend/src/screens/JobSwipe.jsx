
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
    const jobs = await axios.get(`${config.serverIp}/jobs/findJobs/${userId}`)
      .catch((e) => console.log(e));

    this.setState({
      jobs: jobs.data,
      loading: 0,
    });
  }

  shareJob = () => {
    console.log('Shared job');
  }

  dislikeJob = async () => {
    const { userId } = global;
    const { jobs, jobIndex } = this.state;
    await axios.post(`${config.serverIp}/jobs/addDislikedJobs/`, {
      userId,
      jobId: jobs[jobIndex]._id,
    }).catch((e) => console.log(e));

    if (jobs.length == (jobIndex + 1)) {
      const userJobs = await axios.get(`${config.serverIp}/jobs/findJobs/${userId}`)
        .catch((e) => console.log(e));

      this.setState({ loading: 1 });
      this.setState({
        jobs: userJobs.data,
        loading: 0,
      });
    } else {
      this.setState({ jobIndex: jobIndex + 1 });
    }
  }

  likeJob = async () => {
    const { userId } = global;
    const { jobs, jobIndex } = this.state;
    await axios.post(`${config.serverIp}/jobs/addLikedJobs/`, {
      userId,
      jobId: jobs[jobIndex]._id,
    }).catch((e) => console.log(e));

    if (jobs.length === (jobIndex + 1)) {
      const userJobs = await axios.get(`${config.serverIp}/jobs/findJobs/${userId}`)
        .catch((e) => console.log(e));

      this.setState({ loading: 1 });
      this.setState({
        jobs: userJobs.data,
        loading: 0,
      });
    } else {
      this.setState({ jobIndex: jobIndex + 1 });
    }
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
      <View style={[styles.containerStyle]}>
        <MainHeader
          onPressMenu={() => navigation.openDrawer()}
          onPressSend={() => navigation.navigate('SendLikedJobs')}
        />

        <GestureRecognizer
          onSwipeUp={this.shareJob}
          onSwipeLeft={this.dislikeJob}
          onSwipeRight={this.likeJob}
          config={gestureConfig}
        >
          <JobImage
            company={job.company}
          />
        </GestureRecognizer>

        <JobDetails
          job={job}
        />
      </View>
    );
  }
}
