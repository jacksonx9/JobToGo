'use strict';

import React, { Component } from 'react';
import { View, Text } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import axios from 'axios';
import { MainHeader, JobImage, Loader } from '../components';

export default class JobSwipe extends Component {

  constructor(props) {
    super(props);
    this.state = {
      myText: 'I\'m ready to get swiped!',
      jobs: [],
      jobIndex: 0,
      loading: 1
    };
  }

  async componentDidMount() {
    const jobs = await axios.get('http://10.0.2.2:8080/jobs/javascript').catch(e => console.log(e));

    this.setState({
      jobs: jobs.data,
      loading: 0
    })
  }

  shareJob = () => {
    this.setState({ myText: 'shared job' });
  }

  dislikeJob = () => {
    this.setState({ myText: 'disliked job' });
  }

  likeJob = () => {
    this.setState({ myText: 'liked job' });
    this.setState({ jobIndex: this.state.jobIndex + 1 })

  }

  render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };

    if (this.state.loading) return <Loader/>

    return (
      <View>
        <MainHeader />
        <GestureRecognizer
          onSwipeUp={this.shareJob}
          onSwipeLeft={this.dislikeJob}
          onSwipeRight={this.likeJob}
          config={config}
          style={{
            flex: 1,
          }}
        >
          <JobImage
            companyName={this.state.jobs[this.state.jobIndex].company}
          />
        </GestureRecognizer>
      </View>
    )
  }
}

