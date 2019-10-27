'use strict'

import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'
import axios from 'axios'

import { JobImage, JobDetails, Loader, MainHeader } from '../components'
import { serverIp } from '../constants'


export default class JobSwipe extends Component {

  static navigationOptions = {
    drawerLabel: 'Job Swipe'
  }

  constructor(props) {
    super(props)
    this.state = {
      jobs: [],
      jobIndex: 0,
      loading: 1
    }
  }

  async componentDidMount() {
    const userId = global.userId
    console.log(`User id is: ${global.userId}`)
    const jobs = await axios.get(serverIp + '/jobs/findJobs/' + userId)
      .catch(e => console.log(e))

    this.setState({
      jobs: jobs.data,
      loading: 0
    })
  }

  shareJob = () => {
    console.log("Shared job")
  }

  dislikeJob = async () => {
    const userId = global.userId
    await axios.post(serverIp + '/jobs/addDislikedJobs/', {
      userId: userId,
      jobId: this.state.jobs[this.state.jobIndex]._id
    }).catch(e => console.log(e))

    if (this.state.jobs.length == (this.state.jobIndex + 1)) {
      const jobs = await axios.get(serverIp + '/jobs/findJobs/' + userId)
        .catch(e => console.log(e))

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
    const userId = global.userId
    await axios.post(serverIp + '/jobs/addLikedJobs/', {
      userId: userId,
      jobId: this.state.jobs[this.state.jobIndex]._id
    }).catch(e => console.log(e))

    if (this.state.jobs.length == (this.state.jobIndex + 1)) {
      const jobs = await axios.get(serverIp + '/jobs/findJobs/' + userId)
        .catch(e => console.log(e))

      this.setState({ loading: 1 })
      this.setState({
        jobs: jobs.data,
        loading: 0
      })
    } else {
      this.setState({ jobIndex: this.state.jobIndex + 1 })
    }
  }

  render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    }

    if (this.state.loading) return <Loader />

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
    )
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'white',
    height: '100%',
    width: '100%'
  }
})

