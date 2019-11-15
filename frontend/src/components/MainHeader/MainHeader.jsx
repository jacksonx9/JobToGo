import React from 'react';
import { View, Image } from 'react-native';
import { number, func } from 'prop-types';

import ImageButton from '../ImageButton';
import images from '../../constants/images';
import styles from './styles';

const MainHeader = ({ buttonSource, onPress }) => (
  <View style={styles.container}>
    <View style={styles.buttonContainer}>
      <ImageButton
        source={buttonSource}
        onPress={onPress}
      />
    </View>
    <View style={styles.logoContainer}>
      <Image source={images.logoLight} style={styles.logo} />
    </View>
  </View>
);

MainHeader.propTypes = {
  buttonSource: number.isRequired,
  onPress: func.isRequired,
};

export default MainHeader;
