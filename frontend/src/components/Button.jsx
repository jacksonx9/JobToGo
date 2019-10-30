import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { buttonStyles } from '../styles';


const styles = buttonStyles;
const Button = ({
  style, backgroundColor, textColor, title, enable = true, onPress,
}) => (
  <TouchableOpacity
    style={[{
      opacity: enable ? 1 : 0.3,
      backgroundColor,
    }, styles.containerStyle, style]}
    disabled={!enable}
    onPress={onPress}
  >
    <Text style={[{ color: textColor }, styles.textStyle]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default Button;
