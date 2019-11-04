import { StyleSheet } from 'react-native';

import { padding, colours } from '../../styles';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: padding.md,
    paddingHorizontal: padding.md,
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: colours.white,
  },
  logo: {
    width: 170,
    height: 50,
  },
});

export default styles;
