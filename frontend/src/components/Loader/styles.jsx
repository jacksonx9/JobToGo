import { StyleSheet } from 'react-native';

import { dimensions, colours } from '../../styles';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: dimensions.screenHeight,
    width: dimensions.fullWidth,
    backgroundColor: colours.white,
  },
  image: {
    height: 140,
    width: 80,
  },
});

export default styles;
