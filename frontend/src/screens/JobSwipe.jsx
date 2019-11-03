
import React, { Component } from 'react';
import { View } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';
import Swiper from 'react-native-deck-swiper';

import JobImage from '../components/JobImage';
import JobDetails from '../components/JobDetails';
import Loader from '../components/Loader';
import MainHeader from '../components/MainHeader';
import OverlayLabel from '../components/OverlayLabel';
import config from '../constants/config';
import { styleConsts, jobSwipeStyles, overlayLabelStyles } from '../styles';
import colours from '../constants/colours';

const styles = jobSwipeStyles;
export default class JobSwipe extends Component {
  static navigationOptions = {
    drawerLabel: 'Job Swipe',
  }

  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      jobIndex: 0,
      loading: 1,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  async componentDidMount() {
    const { userId } = global;
    this.logger.info(`User id is: ${userId}`);
    this.fetchJobs(userId);
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
        jobs[i].logo = `${companyInfo.logo}?size=${styleConsts.LOGO_SIZE}`;
      } else {
        jobs[i].logo = null;
      }
    })).catch(e => this.logger.error(e));

    this.setState({
      loading: 0,
      jobs,
    });
  }

  shareJob = () => {
    this.logger.info('Shared job');
  }

  getNextJob = (jobNum, jobIndex, userId) => {
    if (jobNum === (jobIndex + 1)) {
      this.fetchJobs(userId);
    } else {
      this.setState({ jobIndex: jobIndex + 1 });
    }
  }

  dislikeJob = async (jobs, jobIndex) => {
    const { userId } = global;
    await axios.post(`${config.ENDP_DISLIKE}`, {
      userId,
      jobId: jobs[jobIndex]._id,
    }).catch(e => this.logger.error(e));

    this.getNextJob(jobs.length, jobIndex, userId);
  }

  likeJob = async (jobs, jobIndex) => {
    const { userId } = global;
    await axios.post(`${config.ENDP_LIKE}`, {
      userId,
      jobId: jobs[jobIndex]._id,
    }).catch(e => this.logger.error(e));

    this.getNextJob(jobs.length, jobIndex, userId);
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
            <View>
              <JobImage
                logo={posting.logo}
              />
              <JobDetails
                company={posting.company}
                title={posting.title}
                location={posting.location}
                description={posting.description}
              />
            </View>
          )}
          onSwipedLeft={() => this.dislikeJob(jobs, jobIndex)}
          onSwipedRight={() => this.likeJob(jobs, jobIndex)}
          cardIndex={jobIndex}
          backgroundColor="white"
          stackSize={1}
          animateOverlayLabelsOpacity
          overlayLabels={{
            left: {
              title: 'NOPE',
              element: <OverlayLabel label="NOPE" color={colours.red} />,
              style: {
                wrapper: overlayLabelStyles.overlayDislike,
              },
            },
            right: {
              title: 'LIKE',
              element: <OverlayLabel label="LIKE" color={colours.green} />,
              style: {
                wrapper: overlayLabelStyles.overlayLike,
              },
            },
          }}
        />
      </View>
    );
  }
}
