import React from 'react';
import { View } from 'react-native';
import { string, bool } from 'prop-types';

import JobDetails from '../JobDetails';
import JobImage from '../JobImage';
import styles from './styles';

const JobCard = ({
  logo, company, title, location, description, isShared,
}) => (
  <View style={styles.container}>
    <JobImage
      logo={logo}
    />
    <JobDetails
      company={company}
      title={title}
      location={isShared ? 'shared' : location}
      description={description}
    />
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
  isShared: bool.isRequired,
};

export default JobCard;
