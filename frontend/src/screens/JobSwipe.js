'use strict';
 
import React, {Component} from 'react';
import {View, Text} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import axios from 'axios';
 
class JobSwipe extends Component {
 
  constructor(props) {
    super(props);
    this.state = {
      myText: 'I\'m ready to get swiped!',
      gestureName: 'none',
      backgroundColor: '#fff',
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
 
  onSwipeUp = () => {
    this.setState({myText: 'shared job'});
  }

  onSwipeLeft = () => {
    this.setState({myText: 'disliked job'});
  }

  onSwipeRight = () => {
    this.setState({myText: 'liked job'});
    this.setState({jobIndex: this.state.jobIndex +1})

  }

  

 
  render() {
 
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };
    if(this.state.loading) return null;

    return (

      <GestureRecognizer
        onSwipeUp={this.onSwipeUp}
        onSwipeLeft={this.onSwipeLeft}
        onSwipeRight={this.onSwipeRight}
        config={config}
        style={{
          flex: 1,
          backgroundColor: this.state.backgroundColor
        }}
        >
        <Text>Job info: {this.state.jobs[this.state.jobIndex].title}</Text>
      </GestureRecognizer>
    );
  }
}
 
export default JobSwipe;