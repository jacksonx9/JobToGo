import { Dimensions } from 'react-native';

export const dimensions = {
  screenHeight: Dimensions.get('window').height,
  fullHeight: Dimensions.get('window').height - 70,
  fullWidth: Dimensions.get('window').width,
};

export const colours = {
  white: 'white',
  primary: '#2564C2',
  secondary: '#b9cbeb',
  accentPrimary: '#f4775a',
  accentSecondary: '#ffbdad',
  gray: '#696969',
  lightGray: '#a6a6a6',
  lighterGray: '#ededed',
  red: '#eb5b5b',
  green: '#4cd971',
};

export const padding = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
  xxl: 50,
};

export const margin = {
  xs: 5,
  sm: 10,
  md: 13,
  lg: 20,
  xl: 30,
};

export const border = {
  radius: 15,
  inputBorderWidth: 1,
};

export const elevation = {
  sm: 6,
  md: 10,
  lg: 20,
};

export const fonts = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 17,
  xl: 23,
  normal: 'Muli-Regular',
  semiBold: 'Muli-SemiBold',
  bold: 'Muli-Bold',
  extraBold: 'Muli-ExtraBold',
};

export const sizes = {
  icon: 25,
  iconLg: 30,
};

export const containers = {
  fullScreenContainer: {
    height: dimensions.fullHeight,
    width: dimensions.fullWidth,
    backgroundColor: colours.white,
  },
};
