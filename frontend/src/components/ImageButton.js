import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';


const ImageButton = ({ source, onPress }) => {
  const {
    containerStyle,
    imageStyle
  } = styles;

  return (
    <TouchableOpacity
        style={[containerStyle]}
        onPress={onPress}
    >
        <Image 
          source={source} 
          style={[imageStyle]} 
        />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageStyle: {

  }
});

export { ImageButton };
