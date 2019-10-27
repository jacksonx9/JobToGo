import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { ImageButton } from '../components'
import { images, fonts, colours } from '../constants'


const NavHeader = ({ title, image, onPressBack, onPressBtn, enableBtn = true }) => {
  
  const {
    containerStyle,
    containerStyle2,
    textStyle
  } = styles;

  if (enableBtn)
    return (
      <View style={[containerStyle]}>
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
    )
  else
    return (
      <View style={[containerStyle2]}>
        <ImageButton
          source={images.iconChevronLeft}
          onPress={onPressBack}
        />
        <Text style={[textStyle]}>{title}</Text>
      </View>
    )
}

const styles = StyleSheet.create({
  containerStyle: {
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white',
    width: '100%'
  },

  containerStyle2: {
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: '45%',
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white',
    width: '100%'
  },
  logoStyle: {
    width: 170,
    height: 50
  },
  textStyle: {
    fontFamily: fonts.normal,
    color: colours.darkGray,
    fontSize: 16
  }
});

export { NavHeader };
