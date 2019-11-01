import { StyleSheet } from 'react-native';

import colours from '../constants/colours';
import fonts from '../constants/fonts';


export const containerStyles = StyleSheet.create({
  flexColContainer: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  flexColAlignCenterContainer: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  flexRowContainer: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  formContainer: {
    paddingTop: 100,
    height: '100%',
    width: '80%',
    position: 'absolute',
  },
  inputContainer: {
    height: 50,
    width: '100%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  alignCenter: {
    alignItems: 'center',
  },
  rowJustifyCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  alignJustifyCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const displayStyles = StyleSheet.create({
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
