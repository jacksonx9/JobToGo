import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';

const ImageButton = ({ source, onPress }) => (
  <TouchableOpacity
    style={[styles.container]}
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
