import React, { Component } from 'react';
import { View, FlatList, TouchableOpacity, Text, TextInput, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import  { Button, SelectableItem, Loader, NavHeader} from '../components';
import { images, colours, fonts } from '../constants'
import axios from 'axios';

export default class SendLikedJobs extends Component {

    static navigationOptions = {
        drawerLabel: 'Liked Jobs',
    };

    constructor(props) {
        super(props);
        this.state = {
          likedJobs: [],
          ids: [],
          jobIndex: 0,
          loading: 1
        };
      }

    async componentDidMount() {
        const likedJobs = await axios.get('http://3.16.169.130:8080/jobs/javascript').catch(e => console.log(e));
        this.setState({
          likedJobs: likedJobs.data,
          loading: 0
        })
    }

    sendLikedJobs = () => {
      alert(this.props.navigation.dangerouslyGetParent().getParam('userId'))
    }
 
    removeLikedJob = (item, index) => {
      alert(`${item.company}: ${index}`)
    }

    render() {
        if (this.state.loading) return <Loader/>

        return (
            <View style={[styles.containerStyle]}>
                <NavHeader
                    title='Your Liked Jobs'
                    image={images.iconSend}
                    onPressBack={() => this.props.navigation.goBack()}
                    onPressBtn={this.sendLikedJobs}
                />
                <FlatList
                    style
                    data={this.state.likedJobs}
                    keyExtractor={(item) => item.url}
                    renderItem={({item, index}) =>
                      <SelectableItem
                        key={item.url}
                        header={item.company}
                        subHeader={item.title}
                        onPress={() => this.removeLikedJob(item, index)}
                    />
                    }
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
