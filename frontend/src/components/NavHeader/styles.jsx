
import { StyleSheet } from 'react-native';

import {
  dimensions, padding, margin, colours, fonts,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 80,
    width: dimensions.fullWidth,
    paddingTop: padding.md,
    paddingHorizontal: padding.lg,
    marginBottom: margin.md,
    backgroundColor: 'transparent',
  },
  text: {
    fontFamily: fonts.extraBold,
    color: colours.primary,
    fontSize: fonts.lg,
  },
});

export default styles;
