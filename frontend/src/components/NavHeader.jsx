import React from 'react';
import { ImageBackground, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import ImageButton from './ImageButton';

import images from '../constants/images';
import { containerStyles, navHeaderStyles } from '../styles';


const styles = { ...containerStyles, ...navHeaderStyles };
const NavHeader = ({
  title, image, onPressBack, onPressBtn, enableBtn,
}) => (
  <View
    style={[styles.flexRowContainer, styles.mainContainer]}
  >
    <Text style={styles.text}>{title}</Text>
  </View>
);

NavHeader.defaultProps = {
  onPressBtn: () => null,
  enableBtn: true,
};

NavHeader.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.number.isRequired,
  onPressBack: PropTypes.func.isRequired,
  onPressBtn: PropTypes.func,
  enableBtn: PropTypes.bool,
};

export default NavHeader;
