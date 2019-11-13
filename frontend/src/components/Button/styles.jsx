import { StyleSheet } from 'react-native';

import { fonts, border } from '../../styles';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: border.radius,
    height: 50,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: fonts.md,
  },
});

export default styles;
