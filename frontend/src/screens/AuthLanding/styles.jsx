import { StyleSheet } from 'react-native';

import {
  containers, padding, margin, border, colours,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: padding.xxl,
  },
  logo: {
    height: 80,
    width: '100%',
    marginTop: 50,
    marginBottom: margin.md,
  },
  image: {
    height: 300,
    width: '100%',
    marginBottom: margin.md,
  },
  googleButton: {
    height: 50,
    width: '100%',
    elevation: 0,
    marginBottom: margin.xs,
    borderRadius: border.borderRadius,
  },
  signInButton: {
    width: '100%',
    marginBottom: margin.xs,
  },
  signUpButton: {
    width: '100%',
    borderColor: colours.accentPrimary,
    borderWidth: 2,
  },
});

export default styles;
