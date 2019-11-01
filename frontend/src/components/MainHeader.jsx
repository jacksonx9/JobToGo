import React from 'react';
import { View, Image } from 'react-native';
import PropTypes from 'prop-types';

import ImageButton from './ImageButton';
import images from '../constants/images';
import { containerStyles, mainHeaderStyles } from '../styles';


const styles = { ...containerStyles, ...mainHeaderStyles };
const MainHeader = ({ onPressMenu, onPressSend }) => (
  <View style={[styles.flexRowContainer, styles.container]}>
    <ImageButton
      source={images.iconMenu}
      onPress={onPressMenu}
    />
    <Image source={images.logoLight} style={[styles.logo]} />
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
