import { Dimensions } from 'react-native';

export const dimensions = {
  fullHeight: Dimensions.get('window').height,
  fullWidth: Dimensions.get('window').width,
};

export const colours = {
  white: 'white',
  primary: '#100B69',
  secondary: '#b7b6d1',
  accentPrimary: '#f4775a',
  gray: '#696969',
};

export const padding = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
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
  inputBorderWidth: 3,
};

export const elevation = {
  md: 10,
};

export const fonts = {
  sm: 12,
  md: 18,
  lg: 28,
  normal: 'Muli-Regular',
  semiBold: 'Muli-SemiBold',
  bold: 'Muli-Bold',
  extraBold: 'Muli-ExtraBold',
};

export const containers = {
  fullScreenContainer: {
    height: dimensions.fullHeight,
    width: dimensions.fullWidth,
  },
};
