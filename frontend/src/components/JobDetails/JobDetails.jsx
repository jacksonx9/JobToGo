import React from 'react';
import { Text, View } from 'react-native';
import { string, func } from 'prop-types';
import Icon from 'react-native-vector-icons/Feather';

import styles from './styles';
import { colours } from '../../styles';
import icons from '../../constants/icons';
import JobDetailsExpanded from './JobDetailsExpanded';

const JobDetails = ({
  company, title, location, testID,
}) => (
  <View style={[styles.container]} testID={testID}>
    <View style={styles.textContainer}>
      <Text style={styles.header}>{company}</Text>
      <View style={styles.subHeaderContainer}>
        <Icon
          name={icons.job}
          color={colours.gray}
          size={icons.sm}
        />
        <Text style={styles.subHeader}>{title}</Text>
      </View>
      <View style={styles.subHeaderContainer}>
        <Icon
          name={icons.map}
          color={colours.gray}
          size={icons.sm}
        />
        <Text style={styles.subHeader}>{location}</Text>
      </View>
    </View>
  </View>
);

JobDetails.defaultProps = {
  testID: '',
};

JobDetails.propTypes = {
  company: string.isRequired,
  title: string.isRequired,
  location: string.isRequired,
  testID: string,
};

export default JobDetails;
