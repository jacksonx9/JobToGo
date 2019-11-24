import { StyleSheet } from 'react-native';

import { padding, dimensions, colours } from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: padding.xl,
    paddingHorizontal: padding.md,
    height: 80,
    width: dimensions.fullWidth,
    backgroundColor: colours.white,
    zIndex: 1000,
  },
  mainContainer: {
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  badge: {
    height: 15,
    width: 15,
    borderRadius: 50,
    left: -11,
    top: -3,
    backgroundColor: colours.accentPrimary,
  },
  logoContainer: {
    justifyContent: 'center',
    height: '100%',
    width: '50%',
  },
  logo: {
    width: 170,
    height: 50,
  },
});

export default styles;
