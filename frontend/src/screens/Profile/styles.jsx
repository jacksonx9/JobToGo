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
    height: 40,
    width: '90%',
  },
  link: {
    fontFamily: fonts.normal,
    fontSize: fonts.sm,
    color: colours.gray,
  },
  image: {
    resizeMode: 'contain',
    maxHeight: '45%',
  },
  warning: {
    fontFamily: fonts.normal,
    fontSize: fonts.sm,
    color: colours.red,
  },
  text: {
    marginTop: margin.xl,
    fontFamily: fonts.bold,
    fontSize: fonts.md,
    marginBottom: margin.sm,
    color: colours.gray,
  },
  errorDisplay: {
    height: '90%',
  },
  profileContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    width: 200,
    padding: padding.sm,
  },
  centeredText: {
    fontFamily: fonts.bold,
    fontSize: fonts.md,
    color: colours.gray,
    marginTop: margin.lg,
    textAlign: 'center',
  },
  centeredTextLarge: {
    fontFamily: fonts.bold,
    fontSize: fonts.lg,
    color: colours.gray,
    marginTop: margin.lg,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.extraBold,
    color: colours.primary,
    fontSize: fonts.xl,
    marginBottom: margin.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: 40,
    width: '100%',
  },
  navLinksContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '35%',
    width: '100%',
  },
  infoContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '50%',
    width: '100%',
  },
});

export default styles;
