import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import axios from 'axios';
import { logger } from 'react-native-logger';

import SelectableItem from '../components/SelectableItem';
import Loader from '../components/Loader';
import NavHeader from '../components/NavHeader';
import images from '../constants/images';
import config from '../constants/config';
import { containerStyles } from '../styles';


const styles = containerStyles;
export default class SendLikedJobs extends Component {
  static navigationOptions = {
    drawerLabel: 'Liked Jobs',
  }

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
      .catch((e) => { logger.log(e); });
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
      }).catch((e) => { logger.log(e); });

    const likedJobs = await axios.get(`${config.ENDP_LIKE}${userId}`)
      .catch((e) => { logger.log(e); });

    this.setState({
      likedJobs: likedJobs.data.result,
      loading: 0,
    });

    logger.log('Sent liked jobs to your email');
  }

  removeLikedJob = (item, index) => {
    logger.log(`${item.company}: ${index}`);
  }

  render() {
    const { loading, likedJobs } = this.state;
    const { navigation } = this.props;
    if (loading) return <Loader />;

    return (
      <View style={[styles.flexColContainer]}>
        <NavHeader
          title="Your Liked Jobs"
          image={images.iconSendAcc}
          onPressBack={() => navigation.goBack()}
          onPressBtn={this.sendLikedJobs}
        />
        <FlatList
          style
          data={likedJobs}
          keyExtractor={(item) => (item._id)}
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
