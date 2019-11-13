
import { StyleSheet } from 'react-native';

import {
  padding, fonts, border,
} from '../../styles';

const styles = StyleSheet.create({
  overlayLabel: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: padding.md,
    borderWidth: 2,
    borderRadius: border.radius,
  },
  overlayLabelText: {
    fontSize: fonts.lg,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
});

export default styles;
