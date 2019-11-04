
import { StyleSheet } from 'react-native';

import {
  dimensions, padding, colours, fonts,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 80,
    width: dimensions.fullWidth,
    paddingTop: padding.md,
    paddingLeft: padding.ls,
    backgroundColor: 'transparent',
  },
  text: {
    fontFamily: fonts.extraBold,
    color: colours.primary,
    fontSize: fonts.lg,
  },
});

export default styles;
