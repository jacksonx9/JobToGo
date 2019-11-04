import { StyleSheet } from 'react-native';

import { dimensions, colours } from '../../styles';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: dimensions.fullHeight,
    width: dimensions.fullWidth,
    backgroundColor: colours.primary,
  },
  image: {
    height: 140,
    width: 80,
  },
});

export default styles;
