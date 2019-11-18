import React from 'react';
import { TouchableOpacity } from 'react-native';
import { number, string, func } from 'prop-types';
import Icon from 'react-native-vector-icons/Feather';

import styles from './styles';
import { colours, sizes } from '../../styles';

const IconButton = ({
  name, color, size, onPress,
}) => (
  <TouchableOpacity
    style={[styles.container]}
    onPress={onPress}
  >
    <Icon name={name} color={color} size={size} />
  </TouchableOpacity>
);

IconButton.defaultProps = {
  color: colours.gray,
  size: sizes.icon,
};

IconButton.propTypes = {
  name: string.isRequired,
  color: string,
  size: number,
  onPress: func.isRequired,
};

export default IconButton;
