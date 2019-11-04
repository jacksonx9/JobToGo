import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';

const NavHeader = ({ title }) => (
  <View
    style={styles.container}
  >
    <Text style={styles.text}>{title}</Text>
  </View>
);

NavHeader.propTypes = {
  title: PropTypes.string.isRequired,
};

export default NavHeader;
