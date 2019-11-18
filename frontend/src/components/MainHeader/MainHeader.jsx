import React from 'react';
import { View, Image } from 'react-native';
import { func } from 'prop-types';

import IconButton from '../IconButton';
import images from '../../constants/images';
import styles from './styles';
import { colours, sizes } from '../../styles';

const MainHeader = ({ onPress }) => (
  <View style={styles.container}>
    <View style={styles.buttonContainer}>
      <IconButton
        name="inbox"
        color={colours.lightGray}
        size={sizes.iconLg}
        onPress={onPress}
      />
    </View>
    <View style={styles.logoContainer}>
      <Image source={images.logoLight} style={styles.logo} />
    </View>
  </View>
);

MainHeader.propTypes = {
  onPress: func.isRequired,
};

export default MainHeader;
