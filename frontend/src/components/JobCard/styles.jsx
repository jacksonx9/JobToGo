import { StyleSheet } from 'react-native';

import {
  colours, border, elevation, padding,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    height: '92%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: border.radius,
    backgroundColor: colours.white,
    elevation: elevation.md,
    padding: padding.lg,
  },
  shareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '10%',
    width: '100%',
    backgroundColor: colours.white,
  },
  contentContainer: {
    height: '80%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default styles;
