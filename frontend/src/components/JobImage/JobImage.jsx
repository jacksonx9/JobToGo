import React from 'react';
import { Image, ViewPropTypes } from 'react-native';
import { string, number } from 'prop-types';

import images from '../../constants/images';
import styles from './styles';

const JobImage = ({ logo, sideLength, style }) => {
  let source = { uri: logo };
  if (logo === null) {
    source = images.imgPlaceholder;
  }
  return (
    <Image
      source={source}
      style={[styles.companyLogo, { height: sideLength, width: sideLength }, style]}
    />
  );
};

JobImage.defaultProps = {
  logo: null,
  sideLength: 200,
  style: [],
};

JobImage.propTypes = {
  logo: string,
  sideLength: number,
  style: ViewPropTypes.style,
};

export default JobImage;
