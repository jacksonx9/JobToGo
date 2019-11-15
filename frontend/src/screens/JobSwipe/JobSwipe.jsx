
import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';
import Swiper from 'react-native-deck-swiper';
import Modal from 'react-native-modal';

import JobCard from '../../components/JobCard';
import ImageButton from '../../components/ImageButton';
import Loader from '../../components/Loader';
import MainHeader from '../../components/MainHeader';
import SelectableItem from '../../components/SelectableItem';
import OverlayLabel from '../../components/OverlayLabel/OverlayLabel';
import config from '../../constants/config';
import styles, { LOGO_SIZE } from './styles';
import { colours } from '../../styles';
import images from '../../constants/images';

export default class JobSwipe extends Component {
  static navigationOptions = {
    drawerLabel: 'Job Swipe',
  }

  constructor(props) {
    super(props);
    this.state = {
      matchedJobs: [],
      matchedJobIndex: 0,
      sharedJobs: [],
      sharedJobIndex: 0,
      friends: [],
      loading: 1,
      sharedJobsView: false,
      isModalVisible: false,
    };
    this.logger = Logger.get(this.constructor.name);
    this.jobTypes = {
      SHARED: 'shared',
      MATCHED: 'matched',
    };
    this.swipeActionTypes = {
      LIKE: 'like',
      DISLIKE: 'dislike',
    };
  }

  async componentDidMount() {
    const { userId } = global;
    this.logger.info(`User id is: ${userId}`);
    this.fetchJobs(userId, this.jobTypes.MATCHED);
    this.fetchJobs(userId, this.jobTypes.SHARED);
    this.fetchFriends(userId);
  }

  fetchFriends = async userId => {
    const friends = await axios.get(`${config.ENDP_FRIENDS}${userId}`)
      .catch(e => this.logger.error(e));

    this.setState({
      friends: friends.data.result,
    });
  }

  fetchJobs = async (userId, jobType) => {
    this.setState({
      loading: 1,
    });

    const fetchSharedJobs = (jobType === this.jobTypes.SHARED);

    const jobsResp = await axios.get(`${fetchSharedJobs
      ? config.ENDP_SHARED_JOBS : config.ENDP_JOBS}${userId}`).catch(e => this.logger.error(e));
    const jobs = jobsResp.data.result;

    // Get the logo url of each company
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

    if (fetchSharedJobs) {
      this.setState({
        loading: 0,
        sharedJobs: jobs,
        sharedJobIndex: 0,
      });
    } else {
      this.setState({
        loading: 0,
        matchedJobs: jobs,
        matchedJobIndex: 0,
      });
    }
  }

openJobShareModal = () => {
  this.setState({ isModalVisible: true });
}

shareJob = async (friend, jobs, jobIndex) => {
  const { userId } = global;
  await axios.post(config.ENDP_SHARE_JOB, {
    userId,
    friendId: friend._id,
    jobId: jobs[jobIndex]._id,
  }).catch(e => this.logger.error(e));
}

swipeJob = async (jobs, jobIndex, jobType, swipeAction) => {
  const { userId } = global;
  const isSharedJob = (jobType === this.jobTypes.SHARED);
  const isLikedJob = (swipeAction === this.swipeActionTypes.LIKE);
  let endpoint;

  if (isSharedJob) {
    if (isLikedJob) {
      endpoint = config.ENDP_LIKE_SHARED;
    } else {
      endpoint = config.ENDP_DISLIKE_SHARED;
    }
  } else if (isLikedJob) {
    endpoint = config.ENDP_LIKE;
  } else {
    endpoint = config.ENDP_DISLIKE;
  }

  const oldIndex = jobIndex;
  if (jobIndex < jobs.length - 1) {
    if (isSharedJob) {
      this.setState({ sharedJobIndex: jobIndex + 1 });
    } else {
      this.setState({ matchedJobIndex: jobIndex + 1 });
    }
  }

  await axios.post(`${endpoint}`, {
    userId,
    jobId: jobs[oldIndex]._id,
  }).catch(e => this.logger.error(e));

  if (jobs.length === (oldIndex + 1)) {
    this.fetchJobs(userId, jobType);
  }
}

render() {
  const {
    loading, sharedJobsView, matchedJobs, matchedJobIndex, sharedJobs, sharedJobIndex, friends,
  } = this.state;
  const { navigation } = this.props;
  const jobs = sharedJobsView ? sharedJobs : matchedJobs;
  const jobIndex = sharedJobsView ? sharedJobIndex : matchedJobIndex;
  const jobType = sharedJobsView ? this.jobTypes.SHARED : this.jobTypes.MATCHED;

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
            isShared={posting.isShared}
          />
        )}
        onSwipedLeft={() => this.swipeJob(jobs, jobIndex, jobType, this.swipeActionTypes.LIKE)}
        onSwipedRight={() => this.swipeJob(jobs, jobIndex, jobType, this.swipeActionTypes.DISLIKE)}
        onTapCard={() => this.openJobShareModal()}
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

      <Modal
        isVisible={this.state.isModalVisible}
      >
        <View style={styles.modalContainer}>
          <View style={styles.exitButtonContainer}>
            <ImageButton
              source={images.iconChevronLeft}
              onPress={() => this.setState({ isModalVisible: false })}
            />
          </View>
          <SelectableItem
            header={jobs[jobIndex].title}
            subHeader={jobs[jobIndex].company}
            onPress={() => console.log('hi')}
            actionIcon=""
            disabled
            backgroundColor={colours.primary}
            titleColor={colours.white}
            descriptionColor={colours.secondary}
          />
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Share this Job with Friends</Text>
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={friends}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <SelectableItem
                  key={item._id}
                  header={item.userName}
                  subHeader={item.email}
                  onPress={() => this.shareJob(item, jobs, jobIndex)}
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
