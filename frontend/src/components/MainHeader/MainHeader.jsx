import React from 'react';
import { View, Image } from 'react-native';

import images from '../../constants/images';
import styles from './styles';

const MainHeader = () => (
  <View style={styles.container}>
    <Image source={images.logoLight} style={[styles.logo]} />
  </View>
);

export default MainHeader;
