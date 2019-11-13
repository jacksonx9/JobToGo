import React from 'react';
import {
  Text, TouchableOpacity, View, Image,
} from 'react-native';
import PropTypes from 'prop-types';

import images from '../../constants/images';
import styles from './styles';

const SelectableItem = ({
  header, subHeader, onPress, actionIcon,
}) => (
  <View style={styles.container}>
    <View style={styles.contentContainer}>
      <Image source={images.jobBackground} style={styles.logo} />
      <View style={[styles.infoContainer]}>
        <Text
          numberOfLines={1}
          style={styles.companyText}
        >
          {header}
        </Text>
        <Text
          numberOfLines={2}
          style={styles.titleText}
        >
          {subHeader}
        </Text>
      </View>
    </View>

    <TouchableOpacity
      style={[styles.buttonContainer]}
      onPress={onPress}
    >
      <Text style={[styles.button]}>{actionIcon}</Text>
    </TouchableOpacity>
  </View>
);

SelectableItem.defaultProps = {
  subHeader: '',
};

SelectableItem.propTypes = {
  header: PropTypes.string.isRequired,
  subHeader: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  actionIcon: PropTypes.string.isRequired,
};

export default SelectableItem;
