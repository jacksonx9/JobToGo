import React from 'react';
import { View, Image } from 'react-native';
import { string, number } from 'prop-types';

import images from '../../constants/images';
import styles from './styles';

const JobImage = ({ logo, sideLength }) => {
  let source = { uri: logo };
  if (logo === null) {
    source = images.iconLogo;
  }
  return (
    <Image
      source={source}
      style={[styles.companyLogo, { height: sideLength, width: sideLength }]}
    />
  );
};

JobImage.defaultProps = {
  logo: null,
  sideLength: 200,
};

JobImage.propTypes = {
  logo: string,
  sideLength: number,
};

export default JobImage;
