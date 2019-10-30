import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';

import { imageButtonStyles } from '../styles';


const styles = imageButtonStyles;
const ImageButton = ({ source, onPress }) => (
  <TouchableOpacity
    style={[styles.containerStyle]}
    onPress={onPress}
  >
    <Image
      source={source}
    />
  </TouchableOpacity>
);

ImageButton.propTypes = {
  source: PropTypes.element.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default ImageButton;
