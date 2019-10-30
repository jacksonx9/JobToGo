import React from 'react';
import { StyleSheet, Image, View } from 'react-native';

import images from '../constants/images';
import colours from '../constants/colours';


const Loader = () => {
  const {
    containerStyle,
    imageStyle,
  } = styles;

  return (
    <View style={[containerStyle]}>
      <Image
        source={images.iconLogo}
        style={[imageStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    height: `${100 }%`,
    backgroundColor: colours.blue,
  },
  imageStyle: {
    height: 140,
    width: 80,
  },
});

export default Loader;
