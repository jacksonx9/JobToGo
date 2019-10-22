import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { ImageButton } from '../components'
import { images } from '../constants'

const MainHeader = ({ onPressMenu, onPressSend }) => {
    const {
        containerStyle,
        logoStyle
      } = styles;

  return (
    <View style = {[containerStyle]}>
        <ImageButton
        source = {images.iconMenu}
        onPress={onPressMenu} 
        />
        <Image source = {images.logoLight} style = {[logoStyle]} />
        <ImageButton
        source = {images.iconSend}
        onPress = {onPressSend} 
        />
    </View>
  );
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
  logoStyle: {
    width: 170,
    height: 50
  }
});

export { MainHeader };
