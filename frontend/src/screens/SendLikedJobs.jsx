import React, { Component } from 'react'
import { View, FlatList, StyleSheet} from 'react-native'
import axios from 'axios'

import SelectableItem from '../components/SelectableItem'
import Loader from '../components/Loader'
import NavHeader from '../components/NavHeader'

import images from '../constants/images'
import colours from '../constants/colours'
import fonts from '../constants/fonts'
import config from '../constants/config'


export default class SendLikedJobs extends Component {

  static navigationOptions = {
    drawerLabel: 'Liked Jobs',
  }

  constructor(props) {
    super(props)
    this.state = {
      likedJobs: [],
      jobIndex: 0,
      loading: 1
    }
  }

  async componentDidMount() {
    const likedJobs = await axios.get(config.serverIp + '/jobs/getLikedJobs/' + global.userId)
      .catch(e => console.log(e))
    
    this.setState({
      likedJobs: likedJobs.data,
      loading: 0
    })
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps != this.props) {
      const likedJobs = await axios.get(config.serverIp + '/jobs/getLikedJobs/' + global.userId)
        .catch(e => console.log(e))
      this.setState({
        likedJobs: likedJobs.data,
        loading: 0
      })
    }
  }

  sendLikedJobs = async () => {
    const userId = global.userId
    await axios.post(config.serverIp + '/jobs/emailUser/',
      {
        userId: userId
      }).catch(e => console.log(e))

    const likedJobs = await axios.get(config.serverIp + '/jobs/getLikedJobs/' + userId)
      .catch(e => console.log(e))
    
    this.setState({
      likedJobs: likedJobs.data,
      loading: 0
    })

    alert('Sent liked jobs to your email')
  }

  removeLikedJob = (item, index) => {
    alert(`${item.company}: ${index}`)
  }

  render() {
    if (this.state.loading) return <Loader />

    return (
      <View style={[styles.containerStyle]}>
        <NavHeader
          title='Your Liked Jobs'
          image={images.iconSendAcc}
          onPressBack={() => this.props.navigation.goBack()}
          onPressBtn={this.sendLikedJobs}
        />
        <FlatList
          style
          data={this.state.likedJobs}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) =>
            <SelectableItem
              key={item._id}
              header={item.company}
              subHeader={item.title}
              onPress={() => this.removeLikedJob(item, index)}
              actionIcon='x'
            />
          }
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
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
})
