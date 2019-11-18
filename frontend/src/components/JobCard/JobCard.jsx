import React from 'react';
import { View } from 'react-native';
import { string, bool, func } from 'prop-types';

import IconButton from '../IconButton';
import JobDetails from '../JobDetails';
import JobImage from '../JobImage';
import { colours, sizes } from '../../styles';
import styles from './styles';

const JobCard = ({
  logo, company, title, location, description, onPressShare,
}) => (
  <View style={styles.container}>
    <View style={styles.shareContainer}>
      <IconButton name="share-2" color={colours.lightGray} size={sizes.icon} onPress={onPressShare} />
    </View>
    <View style={styles.contentContainer}>
      <JobImage
        logo={logo}
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
};

JobCard.propTypes = {
  logo: string,
  company: string.isRequired,
  title: string.isRequired,
  location: string.isRequired,
  description: string.isRequired,
  onPressShare: func.isRequired,
};

export default JobCard;
