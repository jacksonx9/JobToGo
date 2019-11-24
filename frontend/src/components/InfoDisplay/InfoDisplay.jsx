import React from 'react';
import { Image, View, Text } from 'react-native';
import { string, number, object } from 'prop-types';

import images from '../../constants/images';
import { errors } from '../../constants/messages';

import styles from './styles';

const InfoDisplay = ({ message, source, button }) => (
  <View style={styles.container} testID="infoDisplay">
    <Image
      source={source}
      style={styles.image}
    />
    <View style={styles.textContainer}>
      <Text style={styles.text}>{message}</Text>
    </View>
    <View style={styles.button}>
      { button }
    </View>
  </View>
);

InfoDisplay.defaultProps = {
  source: images.iconLogoGray,
  message: errors.default,
  button: null,
};

InfoDisplay.propTypes = {
  source: number,
  message: string,
  /* eslint-disable react/forbid-prop-types */
  button: object,
};

export default InfoDisplay;
