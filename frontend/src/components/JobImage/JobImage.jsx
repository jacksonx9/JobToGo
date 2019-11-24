import React from 'react';
import { Image, ViewPropTypes } from 'react-native';
import { string, number } from 'prop-types';

import images from '../../constants/images';
import styles from './styles';

const placeHolderImages = [
  images.logoBlue,
  images.logoGreen,
  images.logoPink,
  images.logoPurple,
  images.logoOrange,
  images.logoYellow,
];

const getImage = code => {
  if (code.length === 0) {
    return 0;
  }
  const index = (code.charCodeAt(0) + code.charCodeAt(code.length - 1))
  % (placeHolderImages.length - 1);
  return placeHolderImages[index];
};

const JobImage = ({
  logo, sideLength, style, code,
}) => {
  let source = { uri: logo };
  if (logo === null) {
    source = getImage(code);
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
  code: '',
};

JobImage.propTypes = {
  logo: string,
  sideLength: number,
  style: ViewPropTypes.style,
  code: string,
};

export default JobImage;
