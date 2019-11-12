import { StyleSheet } from 'react-native';

import {
  containers, padding, margin, elevation, border, colours, fonts,
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
  },
  overlayLike: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 30,
    marginLeft: 30,
  },
});

export default styles;
export { LOGO_SIZE };