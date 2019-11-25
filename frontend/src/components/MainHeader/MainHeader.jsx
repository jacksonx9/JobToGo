import React from 'react';
import { View, Image } from 'react-native';
import { func, string, bool } from 'prop-types';

import IconButton from '../IconButton';
import images from '../../constants/images';
import styles from './styles';
import { colours, sizes } from '../../styles';

const MainHeader = ({
  onPressLeft, onPressRight, buttonIcon, showBadge,
}) => (
  <View style={styles.container} testID="mainHeader">
    <View style={styles.mainContainer}>
      <IconButton
        testID="inbox"
        name={buttonIcon}
        color={colours.lightGray}
        size={sizes.iconLg}
        onPress={onPressLeft}
      />
      <View style={[styles.badge,
        { backgroundColor: showBadge ? colours.accentPrimary : 'transparent' }]}
      />
      <View style={styles.logoContainer}>
        <Image source={images.logoLight} style={styles.logo} />
      </View>
      <IconButton
        testID="Profile"
        name="menu"
        color={colours.lightGray}
        size={sizes.iconLg}
        onPress={onPressRight}
      />
    </View>
  </View>
);

MainHeader.defaultProps = {
  showBadge: false,
};

MainHeader.propTypes = {
  onPressLeft: func.isRequired,
  onPressRight: func.isRequired,
  buttonIcon: string.isRequired,
  showBadge: bool,
};

export default MainHeader;
