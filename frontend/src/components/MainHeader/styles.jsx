import { StyleSheet } from 'react-native';

import { padding, colours, dimensions } from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: padding.xl,
    height: 80,
    paddingHorizontal: padding.md,
    width: dimensions.fullWidth,
    backgroundColor: colours.white,
    zIndex: 1000,
  },
  mainContainer: {
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: colours.white,
  },
  badge: {
    height: 15,
    width: 15,
    borderRadius: 50,
    left: 20,
    top: -4,
    position: 'absolute',
  },
  logoContainer: {
    maxHeight: '100%',
    maxWidth: '50%',
  },
  logo: {
    width: 170,
    height: 50,
  },
});

export default styles;
