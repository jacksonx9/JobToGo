import React from 'react';
import { TouchableOpacity, Image } from 'react-native';

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

export default ImageButton;
