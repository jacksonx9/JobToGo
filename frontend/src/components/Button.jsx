import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';


const Button = ({
  style, backgroundColor, textColor, title, enable = true, onPress,
}) => {
  const {
    containerStyle,
    textStyle,
  } = styles;

  return (
    <TouchableOpacity
      style={[{
        opacity: enable ? 1 : 0.3,
        backgroundColor,
      }, containerStyle, style]}
      disabled={!enable}
      onPress={onPress}
    >
      <Text style={[{ color: textColor }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 50,
  },
  textStyle: {
    fontSize: 16,
  },
});

export default Button;
