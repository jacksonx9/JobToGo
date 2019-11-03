import React from 'react';
import { ImageBackground, Image } from 'react-native';
import PropTypes from 'prop-types';
import images from '../constants/images';

import { containerStyles, jobImageStyles } from '../styles';


const styles = { ...containerStyles, ...jobImageStyles };
const JobImage = ({ logo }) => (
  <ImageBackground
    source={images.jobBackground}
    style={[styles.flexRowContainer, styles.container]}
  >
    <Image
      source={{ uri: logo }}
      style={[styles.companyLogo]}
    />
  </ImageBackground>
);

JobImage.propTypes = {
  logo: PropTypes.string.isRequired,
};

export default JobImage;
