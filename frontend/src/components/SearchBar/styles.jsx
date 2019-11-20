
import { StyleSheet } from 'react-native';

import {
  padding, margin, colours, fonts, border,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 80,
    width: '100%',
    paddingTop: padding.md,
    marginBottom: margin.md,
    backgroundColor: 'transparent',
  },
  input: {
    height: 50,
    width: '90%',
    marginBottom: margin.sm,
    paddingHorizontal: padding.sm,
    borderRadius: border.radius,
    backgroundColor: colours.lighterGray,
    fontFamily: fonts.normal,
  },
});

export default styles;
