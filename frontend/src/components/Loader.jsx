import React from 'react';
import { Image, View } from 'react-native';

import images from '../constants/images';

import { containerStyles, displayStyles, loaderStyles } from '../styles';


const styles = { ...containerStyles, ...displayStyles, ...loaderStyles };
const Loader = () => (
  <View style={[styles.accentBackground, styles.flexRowContainer]}>
    <Image
      source={images.iconLogo}
      style={[styles.images]}
    />
  </View>
);

export default Loader;
