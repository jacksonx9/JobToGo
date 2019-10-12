import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

//import fonts from '../contants/fonts';

const Button = ({ style, backgroundColor, textColor, title, enable = true, onPress }) => {
  const {
    containerStyle,
    textStyle
  } = styles;

  return (
    <TouchableOpacity
        style={[{
          opacity: enable ? 1 : 0.3,
          backgroundColor
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

const margin = 14;
const styles = StyleSheet.create({
  containerStyle: {
    alignItems: 'center',
    borderRadius: 5,
    margin,
    height: 50
  },
  textStyle: {
    //fontFamily: fonts.regular,
    fontSize: 16,
    margin
  }
});

export { Button };
