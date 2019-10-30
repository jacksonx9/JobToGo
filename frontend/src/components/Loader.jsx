import React from 'react';
import { Image, View } from 'react-native';

import images from '../constants/images';

import { loaderStyles } from '../styles';


const styles = loaderStyles;
const Loader = () => (
  <View style={[styles.containerStyle]}>
    <Image
      source={images.iconLogo}
      style={[styles.imageStyle]}
    />
  </View>
);

export default Loader;
