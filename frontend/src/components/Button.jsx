import React from 'react';
import { Text, TouchableOpacity, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

import { buttonStyles, containerStyles } from '../styles';


const styles = { ...containerStyles, ...buttonStyles };
const Button = ({
  style, backgroundColor, textColor, title, enable, onPress,
}) => (
  <TouchableOpacity
    style={[{
      opacity: enable ? 1 : 0.3,
      backgroundColor,
    }, styles.alignJustifyCenter, styles.container, style]}
    disabled={!enable}
    onPress={onPress}
  >
    <Text style={[{ color: textColor }, styles.text]}>
      {title}
    </Text>
  </TouchableOpacity>
);

Button.defaultProps = {
  style: [],
  backgroundColor: 'black',
  textColor: 'white',
  enable: true,
};

Button.propTypes = {
  style: ViewPropTypes.style,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  title: PropTypes.string.isRequired,
  enable: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
};

export default Button;
