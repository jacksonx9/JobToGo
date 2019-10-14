import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { ImageButton } from '../components'
import { images } from '../constants'

const MainHeader = () => {
    const {
        containerStyle,
        logoStyle
      } = styles;

  return (
    <View style = {[containerStyle]}>
        <ImageButton
        source = {images.iconMenu}
        onPress = {() => console.log('hi')} 
        />
        <Image source = {images.logoLight} style = {[logoStyle]} />
        <ImageButton
        source = {images.iconSend}
        onPress = {() => console.log('hi')} 
        />
    </View>
  );
}

  
const styles = StyleSheet.create({
  containerStyle: {
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  logoStyle: {
    width: 170,
    height: 50
  }
});

export { MainHeader };
