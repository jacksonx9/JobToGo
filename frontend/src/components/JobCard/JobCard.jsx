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
  onPressShare, onPressHide, onPressUndo, testID, showDetails,
}) => (
  <View style={styles.container} testID={testID}>
    <JobDetailsExpanded
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
        name={icons.goBack}
        color={colours.primary}
        size={sizes.icon}
        onPress={() => {
          onPressUndo();
        }}
      />
      <IconButton
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
        logo={logo}
        company={company}
        title={title}
        location={location}
        description={description}
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
  onPressUndo: func.isRequired,
  showDetails: bool,
  testID: string,
};

export default JobCard;
