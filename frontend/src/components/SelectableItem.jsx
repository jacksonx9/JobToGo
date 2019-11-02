import React from 'react';
import {
  Text, TouchableOpacity, View, Image,
} from 'react-native';
import PropTypes from 'prop-types';

import images from '../constants/images';
import { containerStyles, selectableItemStyles } from '../styles';


const styles = { ...containerStyles, ...selectableItemStyles };
const SelectableItem = ({
  header, subHeader, onPress, actionIcon,
}) => (
  <View style={[styles.flexRowContainer, styles.container]}>
    <View style={styles.rowJustifyCenter}>
      <Image source={images.jobBackground} style={[styles.thumbnail]} />
      <View style={[styles.info]}>
        <Text
          style={[styles.text, styles.header]}
        >
          {header}
        </Text>
        <Text
          style={[styles.text, styles.subHeader]}
        >
          {subHeader}
        </Text>
      </View>
    </View>

    <TouchableOpacity onPress={onPress}>
      <Text style={[styles.icon]}>{actionIcon}</Text>
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
