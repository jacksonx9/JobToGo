import React from 'react';
import { StyleSheet, Text, ImageBackground } from 'react-native';

import images from '../constants/images';


const JobImage = ({ companyName }) => {
  const {
    containerStyle,
    textStyle,
  } = styles;

  return (
    <ImageBackground source={images.tempBg1} style={[containerStyle]}>
      <Text style={[textStyle]}>{companyName}</Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 420,
  },
  textStyle: {
    textAlign: 'center',
    fontSize: 50,
    color: 'white',
  },
});

export default JobImage;
