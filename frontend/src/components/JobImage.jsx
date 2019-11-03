import React from 'react';
import { ImageBackground, Image } from 'react-native';
import PropTypes from 'prop-types';

import images from '../constants/images';
import { containerStyles, jobImageStyles } from '../styles';

const styles = { ...containerStyles, ...jobImageStyles };
const JobImage = ({ logo }) => {
  let source = { uri: logo };
  if (logo === null) {
    source = images.iconLogo;
  }
  return (
    <ImageBackground
      source={images.jobBackground}
      style={[styles.flexRowContainer, styles.container]}
    >
      <Image
        source={source}
        style={[styles.companyLogo]}
      />
    </ImageBackground>
  );
};

JobImage.defaultProps = {
  logo: null,
};

JobImage.propTypes = {
  logo: PropTypes.string,
};

export default JobImage;
