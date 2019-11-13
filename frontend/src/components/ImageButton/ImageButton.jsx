import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { number, func } from 'prop-types';

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

ImageButton.defaultProps = {
  onPress: () => {},
};

ImageButton.propTypes = {
  source: number.isRequired,
  onPress: func,
};

export default ImageButton;
