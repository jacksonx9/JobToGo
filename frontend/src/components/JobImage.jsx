import React from 'react';
import { Text, ImageBackground } from 'react-native';

import images from '../constants/images';
import { jobImageStyles } from '../styles';


const styles = jobImageStyles;
const JobImage = ({ companyName }) => (
  <ImageBackground source={images.tempBg1} style={[styles.containerStyle]}>
    <Text style={[styles.textStyle]}>{companyName}</Text>
  </ImageBackground>
);

export default JobImage;
