import { Dimensions } from 'react-native';

export const dimensions = {
  fullHeight: Dimensions.get('window').height,
  fullWidth: Dimensions.get('window').width,
};

export const colours = {
  white: 'white',
  primary: '#2564C2',
  secondary: '#b9cbeb',
  accentPrimary: '#f4775a',
  gray: '#696969',
  lightGray: '#a6a6a6',
  lighterGray: '#ededed',
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
  md: 10,
};

export const fonts = {
  sm: 12,
  md: 15,
  lg: 23,
  normal: 'Muli-Regular',
  semiBold: 'Muli-SemiBold',
  bold: 'Muli-Bold',
  extraBold: 'Muli-ExtraBold',
};

export const containers = {
  fullScreenContainer: {
    height: dimensions.fullHeight,
    width: dimensions.fullWidth,
    backgroundColor: colours.white,
  },
};
