import { StyleSheet } from 'react-native';

import {
  containers, padding, colours, elevation,
} from '../../styles';

const LOGO_SIZE = 200;
const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: padding.md,
  },
  swiperContainer: {
    backgroundColor: colours.white,
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
});

export default styles;
export { LOGO_SIZE };
