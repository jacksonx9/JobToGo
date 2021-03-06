import { StyleSheet } from 'react-native';

import {
  containers, padding, margin, elevation, border, colours, fonts,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: padding.md,
  },
  buttonSection: {
    borderRadius: border.radius,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
    width: '95%',
    paddingHorizontal: padding.lg,
    marginHorizontal: margin.sm,
    marginBottom: margin.md,
    backgroundColor: colours.primary,
    elevation: elevation.md,
  },
  infoContainer: {
    width: '50%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    width: '50%',
  },
  button: {
    width: '20%',
    marginLeft: margin.xs,
    marginBottom: margin.sm,
  },
  bigText: {
    fontSize: fonts.md,
    fontFamily: fonts.bold,
    color: colours.white,
  },
  normalText: {
    fontSize: fonts.sm,
    fontFamily: fonts.bold,
    color: colours.secondary,
  },
  listContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '72%',
    width: '100%',
    backgroundColor: colours.white,
  },
  inputContainer: {
    height: 50,
    width: '70%',
    marginBottom: margin.sm,
    paddingHorizontal: padding.sm,
    borderRadius: border.radius,
    backgroundColor: colours.lighterGray,
    fontFamily: fonts.normal,
  },
  warning: {
    fontFamily: fonts.normal,
    fontSize: fonts.sm,
    color: colours.red,
  },
  errorDisplay: {
    height: '90%',
  },
  addSkillSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    maxHeight: '20%',
    width: '100%',
  },
});

export default styles;
