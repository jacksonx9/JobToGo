import { StyleSheet } from 'react-native';

import {
  containers, padding, colours, border,
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
  modalContainer: {
    height: '90%',
    width: '100%',
    backgroundColor: colours.white,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: border.radius,
    zIndex: 1000,
  },
  listContainer: {
    height: '70%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
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
