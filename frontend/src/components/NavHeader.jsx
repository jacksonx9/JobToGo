import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

import ImageButton from './ImageButton';

import images from '../constants/images';
import { containerStyles, navHeaderStyles } from '../styles';


const styles = { ...containerStyles, ...navHeaderStyles };
const NavHeader = ({
  title, image, onPressBack, onPressBtn, enableBtn,
}) => {
  if (enableBtn) {
    return (
      <View style={[styles.flexRowContainer, styles.mainContainer]}>
        <ImageButton
          source={images.iconChevronLeft}
          onPress={onPressBack}
        />
        <Text>{title}</Text>
        <ImageButton
          source={image}
          onPress={onPressBtn}
        />
      </View>
    );
  }
  return (
    <View style={[styles.flexRowContainer, styles.contentContainer]}>
      <ImageButton
        source={images.iconChevronLeft}
        onPress={onPressBack}
      />
      <Text style={[styles.text]}>{title}</Text>
    </View>
  );
};

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
