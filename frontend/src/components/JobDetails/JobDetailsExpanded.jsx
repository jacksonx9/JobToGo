import React from 'react';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Feather';

import JobImage from '../JobImage';
import styles from './styles';
import { colours } from '../../styles';
import icons from '../../constants/icons';

const JobDetailsExpanded = ({
  logo, company, title, location, description, testID,
}) => (
  <View
    style={styles.detailsContainer}
    testID={`${testID}Description`}
  >
    <View style={styles.logoContainer}>
      <JobImage
        logo={logo}
        sideLength={50}
        code={company}
      />
      <Text style={styles.headerDark}>{company}</Text>
    </View>
    <View style={styles.infoContainer}>
      <View style={[styles.subHeaderContainer]}>
        <Icon
          name={icons.job}
          color={colours.white}
          size={17}
        />
        <Text style={styles.subHeaderDark}>{title}</Text>
      </View>
      <View style={[styles.subHeaderContainer]}>
        <Icon
          name={icons.map}
          color={colours.white}
          size={17}
        />
        <Text style={styles.subHeaderDark}>{location}</Text>
      </View>
    </View>
    <ScrollView style={styles.descContainer}>
      <Text style={styles.normalText}>{description}</Text>
    </ScrollView>
  </View>
);

JobDetailsExpanded.defaultProps = {
  logo: null,
};

JobDetailsExpanded.propTypes = {
  company: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  logo: PropTypes.string,
  testID: PropTypes.string.isRequired,
};

export default JobDetailsExpanded;
