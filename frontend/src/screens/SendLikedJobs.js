import React, { Component } from 'react';
import { View, FlatList, TouchableOpacity, Text, TextInput, Image, StyleSheet } from 'react-native';
import  { Button, SelectableItem, Loader, MainHeader } from '../components';
import { images, colours, fonts } from '../constants'
import axios from 'axios';

export default class SendLikedJobs extends Component {
  
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
        const jobs = await axios.get('http://3.16.169.130:8080/jobs/javascript').catch(e => console.log(e));
    
        this.setState({
          jobs: jobs.data,
          loading: 0
        })
    }

    render() {
        //const likedJob = this.state.jobs.map(item => <SelectableItem header='header' subHeader='subHeader'/> );
        if (this.state.loading) return <Loader/>

        return (
            <View style={[styles.containerStyle]}>
                <MainHeader/>
                <FlatList
                    style
                    data={this.state.jobs}
                    keyExtractor={(item, index) => item.key}
                    renderItem={({item}) => <SelectableItem key={item.company} header={item.company} subHeader={item.title}/>}
                />
            </View>
        );
    };
};


const styles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.blue
  },
  formStyle: {
    paddingTop: 100,
    height: '100%',
    width: '80%',
    position: 'absolute'
  },
  imageStyle: {
    height: 100,
    width: '100%',
    marginBottom: 40
  },
  inputStyle: {
    height: 50,
    width: '100%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'white',
    backgroundColor: colours.darkBlue,
    fontFamily: fonts.normal,
  },
  buttonStyle: {
    marginTop: 5,
    marginBottom: 20
  },
  linkStyle: {
    alignItems: 'center'
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white'
  }
});
 