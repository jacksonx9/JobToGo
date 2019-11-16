import { StyleSheet } from 'react-native';

import {
  containers, padding, margin, fonts, colours,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: padding.xxl,
  },
  button: {
    width: '100%',
    marginTop: margin.md,
    marginBottom: margin.sm,
  },
  image: {
    resizeMode: 'contain',
    maxHeight: '45%',
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.md,
    color: colours.lightGray,
    textAlign: 'center',
    marginBottom: '10%',
  },
});

export default styles;
