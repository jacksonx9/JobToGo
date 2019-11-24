import React from 'react';
import { View, Image } from 'react-native';
import { func, string, bool } from 'prop-types';

import IconButton from '../IconButton';
import images from '../../constants/images';
import styles from './styles';
import { colours, sizes } from '../../styles';

const MainHeader = ({ onPress, buttonIcon, showBadge }) => (
  <View style={styles.container} testID="mainHeader">
    <View style={styles.buttonContainer}>
      <IconButton
        testID="inbox"
        name={buttonIcon}
        color={colours.lightGray}
        size={sizes.iconLg}
        onPress={onPress}
      />
      {showBadge
        ? <View style={styles.badge} /> : <View />}
    </View>
    <View style={styles.logoContainer}>
      <Image source={images.logoLight} style={styles.logo} />
    </View>
  </View>
);

MainHeader.defaultProps = {
  showBadge: false,
};

MainHeader.propTypes = {
  onPress: func.isRequired,
  buttonIcon: string.isRequired,
  showBadge: bool,
};

export default MainHeader;
