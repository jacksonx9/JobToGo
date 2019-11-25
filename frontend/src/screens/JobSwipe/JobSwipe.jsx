
import React, { Component } from 'react';
import { View } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';
import Swiper from 'react-native-deck-swiper';
import { object } from 'prop-types';

import ErrorDisplay from '../../components/ErrorDisplay';
import JobCard from '../../components/JobCard';
import Loader from '../../components/Loader';
import InfoDisplay from '../../components/InfoDisplay';
import MainHeader from '../../components/MainHeader';
import JobShareModal from '../../components/JobShareModal';
import OverlayLabel from '../../components/OverlayLabel/OverlayLabel';
import config from '../../constants/config';
import styles, { LOGO_SIZE } from './styles';
import { colours } from '../../styles';
import { status, errors } from '../../constants/messages';
import icons from '../../constants/icons';

export default class JobSwipe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matchedJobs: [],
      matchedJobIndex: 0,
      sharedJobs: [],
      sharedJobIndex: 0,
      friends: [],
      loading: true,
      isSharedJobsView: false,
      isJobShareModalVisible: false,
      showErrorDisplay: false,
      errorDisplayText: errors.default,
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
    const { socket } = this.props;

    this.logger.info(`User id is: ${userId}`);
    socket.emit(config.SOCKET_USERID, userId);
    socket.on(config.SOCKET_SHARED, data => this.updateSharedJobs(data));
    socket.on(config.SOCKET_FRIENDS, data => this.updateFriends(data));

    this.fetchJobs(userId, this.jobTypes.MATCHED);
    this.fetchFriends(userId);
  }

  fetchFriends = async userId => {
    try {
      const friendsResp = await axios.get(`${config.ENDP_FRIENDS}${userId}`);
      const friends = friendsResp.data.result;

      this.setState({
        friends: friends.map(friend => ({ ...friend, sharedJob: false })),
      });
    } catch (e) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  updateFriends = async data => {
    const friends = data.result;
    if (!friends) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: data.errorMessage,
      });
      return;
    }

    this.setState({
      friends: friends.map(friend => ({ ...friend, sharedJob: false })),
    });
  }

  updateSharedJobs = async data => {
    const sharedJobs = data.result;
    if (!sharedJobs) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: data.errorMessage,
      });
      return;
    }

    this.setState({
      loading: true,
    });

    this.setState({
      loading: false,
      sharedJobs: await this.fetchLogos(sharedJobs),
      sharedJobIndex: 0,
    });
  }

  fetchLogos = async jobs => {
    const logoJobs = jobs;
    await Promise.all(logoJobs.map(async (job, i) => {
      try {
        const companyInfoResp = await axios.get(
          `${config.ENDP_COMPANY_API}${job.company}`,
        );
        const companyInfo = companyInfoResp.data[0];
        if (companyInfo) {
          logoJobs[i].logo = `${companyInfo.logo}?size=${LOGO_SIZE}`;
        } else {
          logoJobs[i].logo = null;
        }
      } catch (e) {
        logoJobs[i].logo = null;
      }
    }));

    return logoJobs;
  }

  fetchJobs = async (userId, jobType) => {
    this.setState({
      loading: true,
    });

    try {
      const fetchSharedJobs = (jobType === this.jobTypes.SHARED);

      const jobsResp = await axios.get(
        `${fetchSharedJobs ? config.ENDP_SHARED_JOBS : config.ENDP_JOBS_FIND}${userId}`,
      );
      const jobs = await this.fetchLogos(jobsResp.data.result);

      if (fetchSharedJobs) {
        this.setState({
          loading: false,
          sharedJobs: jobs,
          sharedJobIndex: 0,
        });
      } else {
        this.setState({
          loading: false,
          matchedJobs: jobs,
          matchedJobIndex: 0,
        });
      }
    } catch (e) {
      this.setState({
        loading: false,
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  openJobShareModal = () => {
    this.setState({
      isJobShareModalVisible: true,
    });
  }

  toggleSharedJobsView = () => {
    const { isSharedJobsView } = this.state;
    this.fetchJobs(global.userId, this.jobTypes.SHARED);
    this.setState({ isSharedJobsView: !isSharedJobsView });
  }

  shareJob = async (friend, jobId, index) => {
    this.logger.info(`Shared job with Id: ${jobId} with ${friend.userName}`);
    const { userId } = global;
    const { friends } = this.state;
    try {
      await axios.post(config.ENDP_SHARE_JOB, {
        userId,
        friendId: friend._id,
        jobId,
      });

      const updatedFriends = friends;
      updatedFriends[index].sharedJob = true;

      this.setState({
        friends: updatedFriends,
      });
    } catch (e) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  }

  swipeSharedJob = async (jobs, jobIndex, swipeAction, userId) => {
    let endpoint;
    if (swipeAction === this.swipeActionTypes.LIKE) {
      endpoint = config.ENDP_LIKE_SHARED;
    } else {
      endpoint = config.ENDP_DISLIKE_SHARED;
    }

    const oldIndex = jobIndex;
    if (jobIndex < jobs.length - 1) {
      this.setState({ sharedJobIndex: jobIndex + 1 });
    }

    try {
      await axios.post(`${endpoint}`, {
        userId,
        jobId: jobs[oldIndex]._id,
      });

      if (jobs.length === (oldIndex + 1)) {
        // No need to fetch more shared jobs since websockets will take care of this.
        // We simply wait for the sharedJobIndex array to be refilled.
        this.setState({ sharedJobs: [] });
      }
    } catch (e) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  };

  swipeMatchedJob = async (jobs, jobIndex, swipeAction, userId) => {
    const { friends } = this.state;
    let endpoint;
    if (swipeAction === this.swipeActionTypes.LIKE) {
      endpoint = config.ENDP_LIKE;
    } else {
      endpoint = config.ENDP_DISLIKE;
    }

    const oldIndex = jobIndex;
    if (jobIndex < jobs.length - 1) {
      this.setState({
        matchedJobIndex: jobIndex + 1,
        // Reset friends like for sharing jobs.
        friends: friends.map(friend => ({ ...friend, sharedJob: false })),
      });
    }

    try {
      await axios.post(`${endpoint}`, {
        userId,
        jobId: jobs[oldIndex]._id,
      });

      if (jobs.length === (oldIndex + 1)) {
        this.fetchJobs(userId, this.jobTypes.MATCHED);
      }
    } catch (e) {
      this.setState({
        showErrorDisplay: true,
        errorDisplayText: !e.response ? errors.default : e.response.data.errorMessage,
      });
    }
  };

  swipeJob = async (jobs, jobIndex, jobType, swipeAction) => {
    this.logger.info(`${swipeAction} ${jobType} job`);
    this.logger.info(`${jobs.length} jobs`);

    const { userId } = global;
    if (jobType === this.jobTypes.SHARED) {
      return this.swipeSharedJob(jobs, jobIndex, swipeAction, userId);
    }
    return this.swipeMatchedJob(jobs, jobIndex, swipeAction, userId);
  }

  render() {
    const {
      loading, isSharedJobsView, isJobShareModalVisible, matchedJobs, matchedJobIndex,
      sharedJobs, sharedJobIndex, friends, showErrorDisplay, errorDisplayText,
    } = this.state;
    const { navigation } = this.props;
    const jobs = isSharedJobsView ? sharedJobs : matchedJobs;
    const jobIndex = isSharedJobsView ? sharedJobIndex : matchedJobIndex;
    const jobType = isSharedJobsView ? this.jobTypes.SHARED : this.jobTypes.MATCHED;
    const job = jobs[jobIndex];
    const buttonIcon = isSharedJobsView ? icons.chevronLeft : icons.inbox;

    if (loading) return <Loader />;

    return (
      <View style={styles.container} testID="jobSwipe">
        <MainHeader
          buttonIcon={buttonIcon}
          onPressLeft={() => this.toggleSharedJobsView()}
          onPressRight={() => navigation.navigate('Profile')}
        />
        <ErrorDisplay
          showDisplay={showErrorDisplay}
          setShowDisplay={show => this.setState({ showErrorDisplay: show })}
          displayText={errorDisplayText}
          style={styles.errorDisplay}
        />
        {jobs.length === 0
          ? <InfoDisplay message={status.noSharedJobs} />
          : (
            <Swiper
              cards={jobs}
              renderCard={posting => (
                <JobCard
                  testID={`card${matchedJobs.indexOf(posting)}`}
                  logo={posting.logo}
                  company={posting.company}
                  title={posting.title}
                  location={posting.location}
                  description={posting.description}
                  onPressShare={() => this.openJobShareModal()}
                />
              )}
              onSwipedLeft={() => this.swipeJob(jobs, jobIndex, jobType,
                this.swipeActionTypes.DISLIKE)}
              onSwipedRight={() => this.swipeJob(jobs, jobIndex, jobType,
                this.swipeActionTypes.LIKE)}
              cardIndex={jobIndex}
              marginTop={35}
              backgroundColor={colours.white}
              stackSize={5}
              animateOverlayLabelsOpacity
              overlayLabels={{
                left: {
                  title: 'NOPE',
                  element: <OverlayLabel label="NOPE" color={colours.red} />,
                  style: {
                    wrapper: styles.overlayDislike,
                  },
                },
                right: {
                  title: 'LIKE',
                  element: <OverlayLabel label="LIKE" color={colours.green} />,
                  style: {
                    wrapper: styles.overlayLike,
                  },
                },
              }}
            />
          )}
        {jobs.length === 0 ? <View />
          : (
            <JobShareModal
              isVisible={isJobShareModalVisible}
              onPressExit={() => this.setState({ isJobShareModalVisible: false })}
              jobTitle={job.title}
              jobCompany={job.company}
              jobId={job._id}
              jobLogo={job.logo}
              friends={friends}
              onPressSend={this.shareJob}
              extraData={this.state}
              showErrorDisplay={showErrorDisplay}
              setShowErrorDisplay={show => this.setState({ showErrorDisplay: show })}
              errorDisplayText={errorDisplayText}
            />
          )}
      </View>
    );
  }
}

JobSwipe.propTypes = {
  socket: object.isRequired, // eslint-disable-line react/forbid-prop-types
};
