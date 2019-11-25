import React from 'react';
import { View } from 'react-native';
import { string, func, bool } from 'prop-types';

import IconButton from '../IconButton';
import { JobDetails, JobDetailsExpanded } from '../JobDetails';
import JobImage from '../JobImage';
import { colours, sizes } from '../../styles';
import styles from './styles';
import icons from '../../constants/icons';

const JobCard = ({
  logo, company, title, location, description,
  onPressShare, onPressInfo, onPressHide, testID, showDetails,
}) => (
  <View style={styles.container}>
    <JobDetailsExpanded
      testID={testID}
      logo={logo}
      company={company}
      title={title}
      location={location}
      description={description}
      isVisible={showDetails}
      onPressHide={onPressHide}
    />
    <View style={styles.shareContainer}>
      <IconButton
        testID={testID}
        name={icons.share}
        color={colours.primary}
        size={sizes.icon}
        onPress={onPressShare}
      />
    </View>
    <View style={styles.contentContainer}>
      <JobImage
        logo={logo}
        code={company}
      />
      <JobDetails
        testID={testID}
        logo={logo}
        company={company}
        title={title}
        location={location}
        description={description}
        onPressInfo={onPressInfo}
      />
    </View>
  </View>
);


JobCard.defaultProps = {
  logo: null,
  showDetails: false,
  testID: '',
};

JobCard.propTypes = {
  logo: string,
  company: string.isRequired,
  title: string.isRequired,
  location: string.isRequired,
  description: string.isRequired,
  onPressShare: func.isRequired,
  onPressHide: func.isRequired,
  onPressInfo: func.isRequired,
  showDetails: bool,
  testID: string,
};

export default JobCard;
