import React from 'react';
import { View } from 'react-native';
import { number, func } from 'prop-types';

import JobDetails from '../JobDetails';
import JobImage from '../JobImage';
import styles from './styles';

const JobCard = ({
  logo, company, title, location, description,
}) => (
  <View style={styles.container}>
    <JobImage
      logo={logo}
    />
    <JobDetails
      company={company}
      title={title}
      location={location}
      description={description}
    />
  </View>
);

JobCard.defaultProps = {
  onPress: () => {},
};

JobCard.propTypes = {
  source: number.isRequired,
  onPress: func,
};

export default JobCard;
