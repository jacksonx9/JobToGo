import { StyleSheet } from 'react-native';

import {
  containers, padding, elevation, border,
} from '../../styles';

const LOGO_SIZE = 200;
const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: padding.md,
  },
  overlayDislike: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 30,
    marginLeft: -30,
    elevation: elevation.lg,
  },
  overlayLike: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 30,
    marginLeft: 30,
    elevation: elevation.lg,
  },
  errorDisplay: {
    zIndex: 10,
    borderRadius: border.radius,
    elevation: elevation.md,
  },
});

export default styles;
export { LOGO_SIZE };
