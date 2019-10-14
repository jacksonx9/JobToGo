import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

//import colors from '../../colors';
//import fonts from '../../fonts';


const Input = ({ style, title, children }) => {
  const {
    containerStyle,
    textStyle
  } = inputStyles;

  return (
    <View style={[containerStyle, style]}>
      <Text style={textStyle}>{title}</Text>
      {children}
    </View>
  );
};

const margin = 7;
export const inputStyles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    margin
  },
  textStyle: {
    //fontFamily: fonts.light,
    fontSize: 14,
    //color: colors.gray,
    marginBottom: margin
  },
  textInputStyle: {
    //fontFamily: fonts.regular,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    //borderColor: colors.gray,
    height: 45
  }
});

export default Input;
