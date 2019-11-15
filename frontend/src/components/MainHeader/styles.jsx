import { StyleSheet } from 'react-native';

import { padding, colours, dimensions } from '../../styles';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: padding.xl,
    paddingHorizontal: padding.md,
    height: 80,
    width: dimensions.fullWidth,
    backgroundColor: colours.secondary,
    zIndex: 1000,
  },
  logo: {
    width: 170,
    height: 50,
  },
});

export default styles;
