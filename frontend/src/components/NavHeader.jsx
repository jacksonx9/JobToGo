import React from 'react';
import { View, Text } from 'react-native';

import ImageButton from './ImageButton';

import images from '../constants/images';
import { navHeaderStyles } from '../styles';


const styles = navHeaderStyles;
const NavHeader = ({
  title, image, onPressBack, onPressBtn, enableBtn = true,
}) => {
  if (enableBtn) {
    return (
      <View style={[styles.containerStyle]}>
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
    <View style={[styles.containerStyle2]}>
      <ImageButton
        source={images.iconChevronLeft}
        onPress={onPressBack}
      />
      <Text style={[styles.textStyle]}>{title}</Text>
    </View>
  );
};

export default NavHeader;
