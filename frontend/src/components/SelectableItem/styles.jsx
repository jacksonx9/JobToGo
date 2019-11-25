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
    elevation: 8,
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
  topLineContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: margin.sm,
  },
  titleText: {
    fontSize: fonts.sm,
    fontFamily: fonts.semiBold,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '25%',
    backgroundColor: colours.secondary,
    borderRadius: border.radius,
  },
  bannerText: {
    fontSize: fonts.xs,
    fontFamily: fonts.bold,
    color: colours.white,
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
  containerShort: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    width: '45%',
    paddingHorizontal: padding.md,
    margin: margin.xs,
    marginLeft: margin.xs + 3,
    borderRadius: border.radius,
    elevation: 8,
  },
});

export default styles;
