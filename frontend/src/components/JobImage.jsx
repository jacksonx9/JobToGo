import React from 'react';
import { Text, ImageBackground } from 'react-native';
import PropTypes from 'prop-types';

import images from '../constants/images';
import { containerStyles, displayStyles, jobImageStyles } from '../styles';


const styles = { ...containerStyles, ...displayStyles, ...jobImageStyles };
const JobImage = ({ company }) => (
  <ImageBackground source={images.tempBg1} style={[styles.flexRowContainer, styles.container]}>
    <Text style={[styles.lightText, styles.text]}>{company}</Text>
  </ImageBackground>
);

JobImage.propTypes = {
  company: PropTypes.string.isRequired,
};

export default JobImage;
