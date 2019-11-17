import React from 'react';
import { View, Text } from 'react-native';
import { string, bool } from 'prop-types';
import { ScrollView } from 'react-native-gesture-handler';

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
      logo={logo}
      company={company}
      title={title}
      location={isShared ? 'shared' : location}
      description={description}
    />
  </View>
);

JobCard.defaultProps = {
  logo: null,
  isShared: false,
};

JobCard.propTypes = {
  logo: string,
  company: string.isRequired,
  title: string.isRequired,
  location: string.isRequired,
  description: string.isRequired,
  isShared: bool,
};

export default JobCard;
