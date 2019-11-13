import { StyleSheet } from 'react-native';

import {
  padding, margin, colours, fonts,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    width: '95%',
    paddingHorizontal: padding.md,
    margin: margin.sm,
    backgroundColor: colours.white,
  },
  accentText: {
    fontSize: fonts.md,
    fontFamily: fonts.bold,
    color: colours.gray,
  },
  accentDot: {
    position: 'relative',
    bottom: 20,
    fontSize: 30,
    fontFamily: fonts.extraBold,
    color: colours.accentPrimary,
  },
  mutedText: {
    fontSize: fonts.md,
    fontFamily: fonts.bold,
    color: colours.lightGray,
  },
  navOptionContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: '50%',
  },
});

export default styles;
