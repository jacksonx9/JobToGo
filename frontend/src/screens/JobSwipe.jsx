
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
    console.log(`User id is: ${global.userId}`);
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
    await axios.post(`${config.serverIp}/jobs/addDislikedJobs/`, {
      userId,
      jobId: this.state.jobs[this.state.jobIndex]._id,
    }).catch((e) => console.log(e));

    if (this.state.jobs.length == (this.state.jobIndex + 1)) {
      const jobs = await axios.get(`${config.serverIp}/jobs/findJobs/${userId}`)
        .catch((e) => console.log(e));

      this.setState({ loading: 1 });
      this.setState({
        jobs: jobs.data,
        loading: 0,
      });
    } else {
      this.setState({ jobIndex: this.state.jobIndex + 1 });
    }
  }

  likeJob = async () => {
    const { userId } = global;
    await axios.post(`${config.serverIp}/jobs/addLikedJobs/`, {
      userId,
      jobId: this.state.jobs[this.state.jobIndex]._id,
    }).catch((e) => console.log(e));

    if (this.state.jobs.length == (this.state.jobIndex + 1)) {
      const jobs = await axios.get(`${config.serverIp}/jobs/findJobs/${userId}`)
        .catch((e) => console.log(e));

      this.setState({ loading: 1 });
      this.setState({
        jobs: jobs.data,
        loading: 0,
      });
    } else {
      this.setState({ jobIndex: this.state.jobIndex + 1 });
    }
  }

  static navigationOptions = {
    drawerLabel: 'Job Swipe',
  }

  render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };

    if (this.state.loading) return <Loader />;

    return (
      <View style={[styles.containerStyle]}>
        <MainHeader
          nav={this.props.navigation}
          onPressMenu={() => this.props.navigation.openDrawer()}
          onPressSend={() => this.props.navigation.navigate('SendLikedJobs')}
        />

        <GestureRecognizer
          onSwipeUp={this.shareJob}
          onSwipeLeft={this.dislikeJob}
          onSwipeRight={this.likeJob}
          config={config}
        >
          <JobImage
            companyName={this.state.jobs[this.state.jobIndex].company}
          />
        </GestureRecognizer>

        <JobDetails
          job={this.state.jobs[this.state.jobIndex]}
        />
      </View>
    );
  }
}
