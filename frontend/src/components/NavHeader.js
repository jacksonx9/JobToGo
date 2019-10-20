import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ImageButton } from '../components'
import { images } from '../constants'

const NavHeader = ({ title, image, onPressBack, onPressBtn }) => {
    const {
        containerStyle,
        logoStyle
      } = styles;

  return (
    <View style = {[containerStyle]}>
        <ImageButton
        source = {images.iconChevronLeft}
        onPress={onPressBack} 
        />
        <Text>{title}</Text>
        <ImageButton
        source = {image}
        onPress = {onPressBtn} 
        />
    </View>
  );
}

  
const styles = StyleSheet.create({
  containerStyle: {
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white',
    width: '100%'
  },
  logoStyle: {
    width: 170,
    height: 50
  }
});

export { NavHeader };
