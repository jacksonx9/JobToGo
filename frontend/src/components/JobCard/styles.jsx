import { StyleSheet } from 'react-native';

import {
  colours, border, elevation,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    height: '92%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: border.radius,
    backgroundColor: colours.white,
    elevation: elevation.md,
  },
});

export default styles;
