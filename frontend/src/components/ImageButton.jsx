import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';

import { containerStyles } from '../styles';


const styles = containerStyles;
const ImageButton = ({ source, onPress }) => (
  <TouchableOpacity
    style={[styles.alignJustifyCenter]}
    onPress={onPress}
  >
    <Image
      source={source}
    />
  </TouchableOpacity>
);

ImageButton.propTypes = {
  source: PropTypes.number.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default ImageButton;
