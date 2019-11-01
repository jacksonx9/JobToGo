import React from 'react';
import { View, Image } from 'react-native';
import PropTypes from 'prop-types';

import ImageButton from './ImageButton';
import images from '../constants/images';
import { mainHeaderStyles } from '../styles';

const styles = mainHeaderStyles;
const MainHeader = ({ onPressMenu, onPressSend }) => (
  <View style={[styles.containerStyle]}>
    <ImageButton
      source={images.iconMenu}
      onPress={onPressMenu}
    />
    <Image source={images.logoLight} style={[styles.logoStyle]} />
    <ImageButton
      source={images.iconSend}
      onPress={onPressSend}
    />
  </View>
);

MainHeader.propTypes = {
  onPressMenu: PropTypes.func.isRequired,
  onPressSend: PropTypes.func.isRequired,
};

export default MainHeader;
