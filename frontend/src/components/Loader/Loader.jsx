import React from 'react';
import { Image, View } from 'react-native';

import images from '../../constants/images';

import styles from './styles';

const Loader = () => (
  <View style={styles.container}>
    <Image
      source={images.iconLogo}
      style={styles.image}
    />
  </View>
);

export default Loader;
