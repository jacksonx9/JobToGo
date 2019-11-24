import React from 'react';
import { Text, View } from 'react-native';
import { string, func } from 'prop-types';
import Icon from 'react-native-vector-icons/Feather';

import IconButton from '../IconButton';
import styles from './styles';
import { colours, sizes } from '../../styles';
import icons from '../../constants/icons';

const JobDetails = ({
  company, title, location, testID, onPressInfo,
}) => (
  <View style={[styles.container]}>
    <View style={styles.textContainer}>
      <Text style={styles.header}>{company}</Text>
      <View style={styles.subHeaderContainer}>
        <Icon
          name={icons.job}
          color={colours.lightGray}
          size={17}
        />
        <Text style={styles.subHeader}>{title}</Text>
      </View>
      <View style={styles.subHeaderContainer}>
        <Icon
          name={icons.map}
          color={colours.lightGray}
          size={17}
        />
        <Text style={styles.subHeader}>{location}</Text>
      </View>
    </View>
    <View style={styles.expandBtnContainer}>
      <IconButton
        testID={`${testID}Open`}
        name={icons.info}
        color={colours.lightGray}
        size={sizes.icon}
        onPress={() => onPressInfo()}
      />
    </View>
  </View>
);

JobDetails.propTypes = {
  company: string.isRequired,
  title: string.isRequired,
  location: string.isRequired,
  onPressInfo: func.isRequired,
  testID: string.isRequired,
};

export default JobDetails;
