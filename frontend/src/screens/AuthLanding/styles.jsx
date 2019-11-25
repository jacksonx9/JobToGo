import { StyleSheet } from 'react-native';

import {
  containers, padding, margin, border, colours,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: padding.lg,
  },
  logo: {
    marginTop: margin.lg,
    resizeMode: 'contain',
    height: '9%',
  },
  image: {
    resizeMode: 'contain',
    height: '50%',
  },
  buttonSection: {
    width: '100%',
    height: '30%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  googleButton: {
    height: 50,
    width: '90%',
    elevation: 0,
    marginBottom: margin.xs,
    borderRadius: border.borderRadius,
  },
  signInButton: {
    width: '90%',
    marginBottom: margin.xs,
  },
  signUpButton: {
    width: '90%',
    borderColor: colours.accentPrimary,
    borderWidth: 2,
  },
  errorDisplay: {
    position: 'absolute',
    zIndex: 10,
  },
});

export default styles;
