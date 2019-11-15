import { StyleSheet } from 'react-native';

import { padding, dimensions } from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: padding.xl,
    paddingHorizontal: padding.md,
    height: 80,
    width: dimensions.fullWidth,
    zIndex: 1000,
  },
  buttonContainer: {
    height: '100%',
    width: '25%',
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
