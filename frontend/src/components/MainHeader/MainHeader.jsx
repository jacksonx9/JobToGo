import React from 'react';
import { View, Image } from 'react-native';
import { func, string } from 'prop-types';

import IconButton from '../IconButton';
import images from '../../constants/images';
import styles from './styles';
import { colours, sizes } from '../../styles';

const MainHeader = ({ onPress, buttonIcon }) => (
  <View style={styles.container} testID="mainHeader">
    <View style={styles.buttonContainer}>
      <IconButton
        testID="inbox"
        name={buttonIcon}
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
  buttonIcon: string.isRequired,

};

export default MainHeader;
