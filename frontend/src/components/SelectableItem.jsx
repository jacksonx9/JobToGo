import React from 'react';
import {
  Text, TouchableOpacity, View, Image,
} from 'react-native';
import PropTypes from 'prop-types';

import images from '../constants/images';
import { selectableItemStyles } from '../styles';


const styles = selectableItemStyles;
const SelectableItem = ({
  header, subHeader, onPress, actionIcon,
}) => (
  <View style={[styles.containerStyle]}>
    <View style={styles.infoContainerStyle}>
      <Image source={images.tempBg1} style={[styles.thumbnailStyle]} />
      <View style={[styles.infoStyle]}>
        <Text
          style={[styles.textStyle, styles.headerStyle]}
        >
          {header}
        </Text>
        <Text
          style={[styles.textStyle, styles.subHeaderStyle]}
        >
          {subHeader}
        </Text>
      </View>
    </View>

    <TouchableOpacity onPress={onPress}>
      <Text style={[styles.iconStyle]}>{actionIcon}</Text>
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
  actionIcon: PropTypes.element.isRequired,
};

export default SelectableItem;
