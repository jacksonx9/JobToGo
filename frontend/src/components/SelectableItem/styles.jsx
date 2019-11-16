import { StyleSheet } from 'react-native';

import {
  padding, margin, border, colours, fonts,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    width: '95%',
    paddingHorizontal: padding.md,
    margin: margin.xs,
    marginLeft: margin.xs + 3,
    borderRadius: border.radius,
    elevation: 10,
  },
  logo: {
    height: 50,
    width: 50,
    borderRadius: border.radius,
    marginRight: margin.lg,
  },
  descriptionText: {
    fontSize: fonts.md,
    fontFamily: fonts.bold,
  },
  titleText: {
    fontSize: fonts.sm,
    fontFamily: fonts.semiBold,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 70,
    width: '10%',
  },
  button: {
    fontSize: fonts.lg,
    color: colours.gray,
  },
  infoContainer: {
    flexDirection: 'column',
    flex: 1,
  },
});

export default styles;
