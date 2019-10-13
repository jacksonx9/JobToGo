'use strict';
 
import React, {Component} from 'react';
import {View, Text} from 'react-native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
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
      loaded: 0
    };
  }

  async componentDidMount() {
    console.log('HIIIIIIII')
    const jobs = await axios.get('http://10.0.2.2:8080/jobs/javascript').catch(e => console.log(e));
    
    this.setState({
      jobs: jobs.data,
      loaded: 1
    })
    
  }
 
  onSwipeUp = (gestureState) => {
    this.setState({myText: 'You swiped up!'});
  }

  onSwipeDown = (gestureState) => {
    this.setState({myText: 'You swiped down!'});
  }

  onSwipeLeft = (gestureState) => {
    this.setState({myText: 'You swiped left!'});
  }

  onSwipeRight = (gestureState) => {
    console.log('swipe')
    this.setState({myText: 'You swiped right!'});
    this.setState({jobIndex: this.state.jobIndex +1})

  }

  onSwipe = (gestureName, gestureState) => {
    const {SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT} = swipeDirections;
    this.setState({gestureName: gestureName});
    switch (gestureName) {
      case SWIPE_UP:
        this.setState({backgroundColor: 'red'});
        break;
      case SWIPE_DOWN:
        this.setState({backgroundColor: 'green'});
        break;
      case SWIPE_LEFT:
        this.setState({backgroundColor: 'blue'});
        break;
      case SWIPE_RIGHT:
        this.setState({backgroundColor: 'yellow'});
        break;
    }
  }

 
  render() {
 
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };
    if(this.state.loaded == 0) return null;

    return (

      <GestureRecognizer
        onSwipe={this.onSwipe}
        onSwipeUp={this.onSwipeUp}
        onSwipeDown={this.onSwipeDown}
        onSwipeLeft={this.onSwipeLeft}
        onSwipeRight={this.onSwipeRight}
        config={config}
        style={{
          flex: 1,
          backgroundColor: this.state.backgroundColor
        }}
        >
        <Text>{this.state.myText}</Text>
        <Text>onSwipe callback received gesture: {this.state.gestureName}</Text>
        <Text>Job info: {this.state.jobs[this.state.jobIndex].title}</Text>
      </GestureRecognizer>
    );
  }
}
 
export default JobSwipe;