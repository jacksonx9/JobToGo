import React from 'react';
import {
  Text, TouchableOpacity, View,
} from 'react-native';
import { string, func, bool } from 'prop-types';

import JobImage from '../JobImage';
import { colours } from '../../styles';
import styles from './styles';

const SelectableItem = ({
  header, subHeader, onPress, actionIcon, disabled, imageSource,
  backgroundColor, titleColor, descriptionColor,
}) => (
  <View style={[styles.container, { backgroundColor }]}>
    <View style={styles.contentContainer}>
      <JobImage
        logo={imageSource}
        style={styles.logo}
      />
      <View style={[styles.infoContainer]}>
        <Text
          numberOfLines={1}
          style={[styles.descriptionText, { color: titleColor }]}
        >
          {header}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.titleText, { color: descriptionColor }]}
        >
          {subHeader}
        </Text>
      </View>
    </View>

    <TouchableOpacity
      style={[styles.buttonContainer]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.button]}>{actionIcon}</Text>
    </TouchableOpacity>
  </View>
);

SelectableItem.defaultProps = {
  subHeader: '',
  disabled: false,
  imageSource: null,
  backgroundColor: colours.white,
  titleColor: colours.primary,
  descriptionColor: colours.gray,
};

SelectableItem.propTypes = {
  header: string.isRequired,
  subHeader: string,
  onPress: func.isRequired,
  actionIcon: string.isRequired,
  disabled: bool,
  imageSource: string,
  backgroundColor: string,
  titleColor: string,
  descriptionColor: string,
};

export default SelectableItem;
