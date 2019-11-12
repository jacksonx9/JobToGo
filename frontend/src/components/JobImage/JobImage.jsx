import React from 'react';
import { View, Image } from 'react-native';
import { string } from 'prop-types';

import images from '../../constants/images';
import styles from './styles';

const JobImage = ({ logo }) => {
  let source = { uri: logo };
  if (logo === null) {
    source = images.iconLogo;
  }
  return (
    <View
      style={styles.container}
    >
      <Image
        source={source}
        style={styles.companyLogo}
      />
    </View>
  );
};

JobImage.defaultProps = {
  logo: null,
};

JobImage.propTypes = {
  logo: string,
};

export default JobImage;
