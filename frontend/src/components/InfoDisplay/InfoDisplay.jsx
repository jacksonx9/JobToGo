import React from 'react';
import { Image, View, Text } from 'react-native';
import { string, number } from 'prop-types';

import images from '../../constants/images';
import { errors } from '../../constants/messages';

import styles from './styles';

const InfoDisplay = ({ message, source, }) => (
  <View style={styles.container} testID="infoDisplay">
    <Image
      source={source}
      style={styles.image}
    />
    <View style={styles.textContainer}>
      <Text style={styles.text}>{message}</Text>
    </View>
  </View>
);

InfoDisplay.defaultProps = {
  source: images.iconLogoGray,
  message: errors.default,
};

InfoDisplay.propTypes = {
  source: number,
  message: string,
};

export default InfoDisplay;
