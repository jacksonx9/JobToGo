import React, { Component } from 'react';
import { View, FlatList, Text } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import SelectableItem from '../../components/SelectableItem';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import config from '../../constants/config';
import styles from './styles';
import { colours } from '../../styles';

export default class Search extends Component {
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
    const likedJobsResp = await axios.get(`${config.ENDP_LIKE}${userId}`)
      .catch(e => this.logger.error(e));
    const likedJobs = likedJobsResp.data.result;

    // Get the logo url of each company
    await Promise.all(likedJobs.map(async (job, i) => {
      const companyInfoResp = await axios.get(
        `${config.ENDP_COMPANY_API}${job.company}`,
      );
      const companyInfo = companyInfoResp.data[0];
      if (companyInfo) {
        likedJobs[i].logo = `${companyInfo.logo}?size=${80}`;
      } else {
        likedJobs[i].logo = null;
      }
    })).catch(e => this.logger.error(e));

    this.setState({
      likedJobs,
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
    if (loading) return <Loader />;

    return (
      <View style={styles.container}>
        <SearchBar/>

        <View style={styles.listContainer}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={likedJobs}
            keyExtractor={item => item._id}
            renderItem={({ item, index }) => (
              <SelectableItem
                key={item._id}
                header={item.company}
                subHeader={item.title}
                onPress={() => this.removeLikedJob(item, index)}
                actionIcon="x"
                imageSource={item.logo}
              />
            )}
          />
        </View>
      </View>
    );
  }
}
