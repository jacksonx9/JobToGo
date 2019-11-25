import React from 'react';
import { Text, View, Modal } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { string, func, bool } from 'prop-types';
import Icon from 'react-native-vector-icons/Feather';

import IconButton from '../IconButton';
import JobImage from '../JobImage';
import styles from './styles';
import { colours } from '../../styles';
import icons from '../../constants/icons';

const JobDetailsExpanded = ({
  logo, company, title, location, description, isVisible, testID, onPressHide,
}) => (
  <Modal
    animationType="slide"
    transparent
    visible={isVisible}
  >
    <View
      style={styles.detailsContainer}
      testID={`${testID}Description`}
    >
      <IconButton
        testID={`${testID}Close`}
        name={icons.chevronDown}
        color={colours.gray}
        size={icons.lg}
        onPress={() => {
          onPressHide();
        }}
      />
      <View style={styles.logoContainer}>
        <JobImage
          logo={logo}
          sideLength={50}
          code={company}
        />
        <Text style={styles.header}>{company}</Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={[styles.subHeaderContainer]}>
          <Icon
            name={icons.job}
            color={colours.gray}
            size={icons.sm}
          />
          <Text style={styles.subHeader}>{title}</Text>
        </View>
        <View style={[styles.subHeaderContainer]}>
          <Icon
            name={icons.map}
            color={colours.gray}
            size={icons.sm}
          />
          <Text style={styles.subHeader}>{location}</Text>
        </View>
      </View>
      <ScrollView style={styles.descContainer}>
        <Text style={styles.normalText}>{description}</Text>
      </ScrollView>
    </View>
  </Modal>
);

JobDetailsExpanded.defaultProps = {
  logo: null,
};

JobDetailsExpanded.propTypes = {
  company: string.isRequired,
  title: string.isRequired,
  location: string.isRequired,
  description: string.isRequired,
  logo: string,
  onPressHide: func.isRequired,
  isVisible: bool.isRequired,
  testID: string.isRequired,
};

export default JobDetailsExpanded;
