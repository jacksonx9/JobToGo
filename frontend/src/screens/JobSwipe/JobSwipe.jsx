
import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';
import Swiper from 'react-native-deck-swiper';
import Modal from 'react-native-modal';

import JobCard from '../../components/JobCard';
import Loader from '../../components/Loader';
import MainHeader from '../../components/MainHeader';
import SelectableItem from '../../components/SelectableItem';
import OverlayLabel from '../../components/OverlayLabel/OverlayLabel';
import config from '../../constants/config';
import styles, { LOGO_SIZE } from './styles';
import { colours } from '../../styles';

export default class JobSwipe extends Component {
  static navigationOptions = {
    drawerLabel: 'Job Swipe',
  }

  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      jobIndex: 0,
      friends: [],
      loading: 1,
      isModalVisible: false,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
    const { userId } = global;
    this.logger.info(`User id is: ${userId}`);
    this.fetchJobs(userId);
  }


  fetchFriends = async () => {
    const { userId } = global;
    const friends = await axios.get(`${config.ENDP_FRIENDS}${userId}`)
      .catch(e => this.logger.error(e));

    this.setState({
      friends: friends.data.result,
    });
  }

  fetchJobs = async userId => {
    this.setState({
      loading: 1,
    });
    const jobsResp = await axios.get(`${config.ENDP_JOBS}${userId}`).catch(e => this.logger.error(e));
    const jobs = jobsResp.data.result;

    await Promise.all(jobs.map(async (job, i) => {
      const companyInfoResp = await axios.get(
        `${config.ENDP_COMPANY_API}${job.company}`,
      );
      const companyInfo = companyInfoResp.data[0];
      if (companyInfo) {
        jobs[i].logo = `${companyInfo.logo}?size=${LOGO_SIZE}`;
      } else {
        jobs[i].logo = null;
      }
    })).catch(e => this.logger.error(e));

    this.setState({
      loading: 0,
      jobs,
      jobIndex: 0,
    });
  }

  shareJob = async friend => {
    const { userId } = global;
    // await axios.delete(config.ENDP_FRIENDS, {
    //   data: {
    //     userId,
    //     friendId: item._id,
    //   },
    // }).catch(e => this.logger.error(e));

    // this.setState({
    //   sentJobFriends: pendingFriends.data.result,
    //   loading: 0,
    // });
    console.log(friend.title);
  }

  getNextJob = (jobNum, jobIndex, userId) => {
    if (jobNum === (jobIndex + 1)) {
      this.fetchJobs(userId);
    }
  }

  dislikeJob = async (jobs, jobIndex) => {
    const { userId } = global;
    const oldIndex = jobIndex;
    if (jobIndex < jobs.length - 1) {
      this.setState({ jobIndex: jobIndex + 1 });
    }
    await axios.post(`${config.ENDP_DISLIKE}`, {
      userId,
      jobId: jobs[oldIndex]._id,
    }).catch(e => this.logger.error(e));

    this.getNextJob(jobs.length, oldIndex, userId);
  }

  likeJob = async (jobs, jobIndex) => {
    const { userId } = global;
    const oldIndex = jobIndex;
    if (jobIndex < jobs.length - 1) {
      this.setState({ jobIndex: jobIndex + 1 });
    }
    await axios.post(`${config.ENDP_LIKE}`, {
      userId,
      jobId: jobs[oldIndex]._id,
    }).catch(e => this.logger.error(e));

    this.getNextJob(jobs.length, oldIndex, userId);
  }

  render() {
    const { loading, jobs, jobIndex } = this.state;
    const { navigation } = this.props;

    if (loading) return <Loader />;

    return (
      <View style={[styles.container]}>
        <MainHeader
          onPressMenu={() => navigation.openDrawer()}
          onPressSend={() => navigation.navigate('SendLikedJobs')}
        />
        <Swiper
          cards={jobs}
          renderCard={posting => (
            <JobCard
              logo={posting.logo}
              company={posting.company}
              title={posting.title}
              location={posting.location}
              description={posting.description}
            />
          )}
          onSwipedLeft={() => this.dislikeJob(jobs, jobIndex)}
          onSwipedRight={() => this.likeJob(jobs, jobIndex)}
          onSwipedTop={() => this.setState({ isModalVisible: true })}
          cardIndex={jobIndex}
          marginTop={35}
          backgroundColor={colours.white}
          stackSize={5}
          animateOverlayLabelsOpacity
          overlayLabels={{
            left: {
              title: 'NOPE',
              element: <OverlayLabel label="NOPE" color={colours.primary} />,
              style: {
                wrapper: styles.overlayDislike,
              },
            },
            right: {
              title: 'LIKE',
              element: <OverlayLabel label="LIKE" color={colours.accentPrimary} />,
              style: {
                wrapper: styles.overlayLike,
              },
            },
          }}
        />

        <Modal isVisible={this.state.isModalVisible}>
          <View style={styles.modalContainer}>

            <SelectableItem
              key={jobs[jobIndex]._id}
              header={jobs[jobIndex].title}
              subHeader={jobs[jobIndex].company}
              onPress={() => console.log('hi')}
              actionIcon=""
              disabled
              backgroundColor={colours.primary}
              titleColor={colours.white}
              descriptionColor={colours.secondary}
            />
            <View style={styles.listContainer}>
              <FlatList
                data={jobs}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <SelectableItem
                    key={item._id}
                    header={item.title}
                    subHeader={item.company}
                    onPress={() => this.shareJob(item)}
                    actionIcon="+"
                  />
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}
