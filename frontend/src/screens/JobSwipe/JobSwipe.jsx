
import React, { Component } from 'react';
import { View } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';
import Swiper from 'react-native-deck-swiper';

import JobCard from '../../components/JobCard';
import Loader from '../../components/Loader';
import MainHeader from '../../components/MainHeader';
import OverlayLabel from '../../components/OverlayLabel/OverlayLabel';
import config from '../../constants/config';
import styles, { LOGO_SIZE } from './styles';
import { colours } from '../../styles';
import images from '../../constants/images';
import JobShareModal from '../../components/JobShareModal';

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
      isSharedJobsView: false,
      isJobShareModalVisible: false,
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
      ? config.ENDP_LIKE : config.ENDP_JOBS}${userId}`).catch(e => this.logger.error(e));
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
    this.setState({ isJobShareModalVisible: true });
  }

  toggleSharedJobsView = () => {
    const { userId } = global;
    const { isSharedJobsView } = this.state;
    this.fetchJobs(userId, this.jobTypes.SHARED);
    this.setState({ isSharedJobsView: !isSharedJobsView });
  }

  shareJob = async (friend, jobId) => {
    this.logger.info(`Shared job with Id: ${jobId} with ${friend.userName}`);
    const { userId } = global;
    await axios.post(config.ENDP_SHARE_JOB, {
      userId,
      friendId: friend._id,
      jobId,
    }).catch(e => this.logger.error(e));
  }

  swipeJob = async (jobs, jobIndex, jobType, swipeAction) => {
    this.logger.info(`${swipeAction} ${jobType} job`);

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
      loading, isSharedJobsView, isJobShareModalVisible, matchedJobs, matchedJobIndex,
      sharedJobs, sharedJobIndex, friends,
    } = this.state;
    const jobs = isSharedJobsView ? sharedJobs : matchedJobs;
    const jobIndex = isSharedJobsView ? sharedJobIndex : matchedJobIndex;
    const jobType = isSharedJobsView ? this.jobTypes.SHARED : this.jobTypes.MATCHED;
    const job = jobs[jobIndex];
    const menuButtonSource = isSharedJobsView ? images.iconChevronLeft : images.iconInbox;

    if (loading) return <Loader />;

    return (
      <View style={[styles.container]}>
        <MainHeader
          buttonSource={menuButtonSource}
          onPress={() => this.toggleSharedJobsView()}
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

        <JobShareModal
          isVisible={isJobShareModalVisible}
          onPressExit={() => this.setState({ isJobShareModalVisible: false })}
          jobTitle={job.title}
          jobCompany={job.company}
          jobId={job._id}
          friends={friends}
          onPressSend={this.shareJob}
        />
      </View>
    );
  }
}
