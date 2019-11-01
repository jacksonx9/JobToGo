import React from 'react';
import { Image, View } from 'react-native';

import images from '../constants/images';

import { containerStyles, displayStyles, loaderStyles } from '../styles';


const styles = { ...containerStyles, ...displayStyles, ...loaderStyles };
const Loader = () => (
  <View style={[styles.flexRowContainer, styles.accentBackground]}>
    <Image
      source={images.iconLogo}
      style={[styles.image]}
    />
  </View>
);

export default Loader;
