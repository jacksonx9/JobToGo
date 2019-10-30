import React from 'react';
import { Text, ImageBackground } from 'react-native';
import PropTypes from 'prop-types';

import images from '../constants/images';
import { jobImageStyles } from '../styles';


const styles = jobImageStyles;
const JobImage = ({ company }) => (
  <ImageBackground source={images.tempBg1} style={[styles.containerStyle]}>
    <Text style={[styles.textStyle]}>{company}</Text>
  </ImageBackground>
);

JobImage.propTypes = {
  company: PropTypes.string.isRequired,
};

export default JobImage;
