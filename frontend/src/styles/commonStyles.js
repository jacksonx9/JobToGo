import { StyleSheet, Dimensions } from 'react-native';

import colours from '../constants/colours';
import fonts from '../constants/fonts';


export const styleConsts = {
  LOGO_SIZE: 200,
};

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
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
  accentContainer: {
    height: screenHeight * 0.75,
    width: screenWidth,
    padding: 30,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    backgroundColor: colours.white,
    position: 'absolute',
    top: 120,
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
  lightBackground: {
    backgroundColor: colours.white,
  },
  inputDark: {
    color: 'white',
    borderBottomWidth: 4,
    borderBottomColor: colours.lightBlue,
    fontFamily: fonts.normal,
  },
});
