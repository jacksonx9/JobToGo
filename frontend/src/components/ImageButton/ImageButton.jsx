import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { number, func, string } from 'prop-types';

import styles from './styles';

const ImageButton = ({ source, onPress, testID }) => (
  <TouchableOpacity
    testID={testID}
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
  testID: '',
};

ImageButton.propTypes = {
  source: number.isRequired,
  onPress: func,
  testID: string,
};

export default ImageButton;
