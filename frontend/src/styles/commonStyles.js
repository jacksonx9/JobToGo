import { StyleSheet } from 'react-native';

import colours from '../constants/colours';
import fonts from '../constants/fonts';

export const containerStyles = StyleSheet.create({
  alignCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  rowJustifyCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  colAlignCenter: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  alignJustifyCenter: {
    ...this.alignCenter,
    ...this.justifyCenter,
  },
  fullContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  colAlignCenterContainer: {
    ...this.fullContainer,
    ...this.colAlignCenter,
  },
  rowContainer: {
    ...this.fullContainer,
    ...this.alignJustifyCenter,
  },
  formContainer: {
    height: '100%',
    width: '80%',
    position: 'absolute',
    paddingTop: 100,
  },
  inputContainer: {
    height: 50,
    width: '100%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export const contentStyles = StyleSheet.create({
  lightText: {
    color: 'white',
    textDecorationColor: 'white',
  },
  accentBackground: {
    backgroundColor: colours.blue,
  },
  inputDark: {
    color: 'white',
    backgroundColor: colours.darkBlue,
    fontFamily: fonts.normal,
  },
});
