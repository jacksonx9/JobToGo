import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import axios from 'axios';

import SelectableItem from '../components/SelectableItem';
import Loader from '../components/Loader';
import NavHeader from '../components/NavHeader';

import images from '../constants/images';
import config from '../constants/config';
import { sendLikedJobsStyles } from '../styles';


const styles = sendLikedJobsStyles;
export default class SendLikedJobs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      likedJobs: [],
      loading: 1,
    };
  }

  async componentDidMount() {
    this.fetchLikedJobs();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.fetchLikedJobs();
    }
  }

  fetchLikedJobs = async () => {
    const { userId } = global;
    const likedJobs = await axios.get(`${config.ENDP_LIKE}${userId}`)
      .catch((e) => console.log(e));
    this.setState({
      likedJobs: likedJobs.data.result,
      loading: 0,
    });
  }

  sendLikedJobs = async () => {
    const { userId } = global;
    await axios.post(`${config.ENDP_EMAIL}`,
      {
        userId,
      }).catch((e) => console.log(e));

    const likedJobs = await axios.get(`${config.ENDP_LIKE}${userId}`)
      .catch((e) => console.log(e));

    this.setState({
      likedJobs: likedJobs.data.result,
      loading: 0,
    });

    alert('Sent liked jobs to your email');
  }

  removeLikedJob = (item, index) => {
    alert(`${item.company}: ${index}`);
  }

  static navigationOptions = {
    drawerLabel: 'Liked Jobs',
  }

  render() {
    const { loading, likedJobs } = this.state;
    const { navigation } = this.props;
    if (loading) return <Loader />;

    return (
      <View style={[styles.containerStyle]}>
        <NavHeader
          title="Your Liked Jobs"
          image={images.iconSendAcc}
          onPressBack={() => navigation.goBack()}
          onPressBtn={this.sendLikedJobs}
        />
        <FlatList
          style
          data={likedJobs}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <SelectableItem
              key={item._id}
              header={item.company}
              subHeader={item.title}
              onPress={() => this.removeLikedJob(item, index)}
              actionIcon="x"
            />
          )}
        />
      </View>
    );
  }
}
