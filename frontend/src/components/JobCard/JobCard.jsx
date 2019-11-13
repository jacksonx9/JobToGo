import React from 'react';
import { View } from 'react-native';
import { string } from 'prop-types';

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
  logo: null,
};

JobCard.propTypes = {
  logo: string,
  company: string.isRequired,
  title: string.isRequired,
  location: string.isRequired,
  description: string.isRequired,
};

export default JobCard;
