'use strict';

import React, { Component } from 'react';
import { View } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import axios from 'axios';
import { JobImage, JobDetails, Loader, MainHeader } from '../components';
import { serverIp } from '../constants'


export default class JobSwipe extends Component {

  static navigationOptions = {
    drawerLabel: 'Job Swipe',
  };
  
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
    const userId = this.props.navigation.dangerouslyGetParent().getParam('userId')
    console.log(userId)
    const jobs = await axios.get(serverIp+'/jobs/findJobs/'+userId).catch(e => console.log(e));

    this.setState({
       jobs: jobs.data, 
       loading: 0
     })
  }

  shareJob = () => {
    this.setState({ myText: 'shared job' });
  }

  dislikeJob = async () => {
    await axios.post(serverIp+'/jobs/addDislikedJobs/', {
      userId: this.props.navigation.dangerouslyGetParent().getParam('userId'),
      jobId: this.state.jobs[this.state.jobIndex]._id
    }).catch(e => console.log(e))
  
    if(this.state.jobs.length == (this.state.jobIndex + 1)) {
      const jobs = await axios.get(serverIp+'/jobs/findJobs/'+userId).catch(e => console.log(e));
      this.setState({ loading: 1 })
      this.setState({
        jobs: jobs.data, 
        loading: 0
      })
    } else {  
      this.setState({ jobIndex: this.state.jobIndex + 1 })
    }
  }

  likeJob = async () => {
    await axios.post(serverIp+'/jobs/addLikedJobs/', {
      userId: this.props.navigation.dangerouslyGetParent().getParam('userId'),
      jobId: this.state.jobs[this.state.jobIndex]._id
    }).catch(e => console.log(e))

    if(this.state.jobs.length == (this.state.jobIndex + 1)) {
      const jobs = await axios.get(serverIp+'/jobs/findJobs/'+userId).catch(e => console.log(e));
      this.setState({ loading: 1 })
      this.setState({
        jobs: jobs.data, 
        loading: 0
      })
    } else {  
      this.setState({ jobIndex: this.state.jobIndex + 1 })
    }
  }

  onPressSignIn = () => {
    this.props.navigation.navigate('SendLikedJobs', {userId: userId})
  }

  render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };

    if (this.state.loading) return <Loader/>

    return (
      <View>
        <MainHeader 
          nav={this.props.navigation}
          onPressMenu={() => this.props.navigation.openDrawer()}
          onPressSend={() => this.props.navigation.navigate('SendLikedJobs', {userId: this.props.navigation.dangerouslyGetParent().getParam('userId')})}
        />
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
          <JobDetails
            company={this.state.jobs[this.state.jobIndex].company}
            job={this.state.jobs[this.state.jobIndex].title}
            location={this.state.jobs[this.state.jobIndex].location}
          />
        </GestureRecognizer>
      </View>
    );
  };
};

