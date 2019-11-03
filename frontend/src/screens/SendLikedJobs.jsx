import React, { Component } from 'react';
import { View, FlatList, ImageBackground } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import SelectableItem from '../components/SelectableItem';
import Loader from '../components/Loader';
import NavHeader from '../components/NavHeader';
import images from '../constants/images';
import config from '../constants/config';
import { containerStyles, displayStyles } from '../styles';


const styles = { ...containerStyles, ...displayStyles };
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
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
    this.fetchLikedJobs();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      // this.fetchLikedJobs();
    }
  }

  fetchLikedJobs = async () => {
    const { userId } = global;
    const likedJobs = await axios.get(`${config.ENDP_LIKE}${userId}`)
      .catch(e => this.logger.error(e));
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
      }).catch(e => this.logger.error(e));

    const likedJobs = await axios.get(`${config.ENDP_LIKE}${userId}`)
      .catch(e => this.logger.error(e));

    this.setState({
      likedJobs: likedJobs.data.result,
      loading: 0,
    });

    this.logger.info('Sent liked jobs to your email');
  }

  removeLikedJob = (item, index) => {
    this.logger.info(`${item.company}: ${index}`);
  }

  render() {
    const { loading, likedJobs } = this.state;
    const { navigation } = this.props;
    if (loading) return <Loader />;

    return (
      <ImageBackground
        source={images.navBarBackground}
        style={[styles.flexColContainer]}
      >
        <NavHeader
          title="Liked Jobs"
          image={images.iconSendColoured}
          onPressBack={() => navigation.goBack()}
          onPressBtn={this.sendLikedJobs}
        />
        <View style={[styles.accentContainer]}>
          <FlatList
            data={likedJobs}
            keyExtractor={item => item._id}
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
      </ImageBackground>
    );
  }
}
