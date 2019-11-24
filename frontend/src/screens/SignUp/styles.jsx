import { StyleSheet } from 'react-native';

import {
  containers, padding, margin, border, colours, fonts,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: padding.lg,
  },
  inputContainer: {
    height: 50,
    width: '90%',
    marginBottom: margin.sm,
    paddingHorizontal: padding.sm,
    borderRadius: border.radius,
    backgroundColor: colours.lighterGray,
    fontFamily: fonts.normal,
  },
  logo: {
    height: 80,
    width: '100%',
    transform: [{ scale: 0.65 }],
    marginTop: 100,
    marginBottom: 50,
  },
  button: {
    width: '90%',
    marginTop: margin.md,
    marginBottom: margin.sm,
  },
  link: {
    fontFamily: fonts.normal,
    fontSize: fonts.sm,
    color: colours.gray,
  },
  warning: {
    fontFamily: fonts.normal,
    fontSize: fonts.lg,
    color: colours.red,
  },
});

export default styles;
