import { StyleSheet } from 'react-native';

import {
  colours, fonts, margin, padding, elevation,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '55%',
    width: '100%',
    padding: padding.md,
    overflow: 'scroll',
    backgroundColor: colours.white,
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    height: '85%',
    width: '100%',
    overflow: 'scroll',
    backgroundColor: colours.white,
  },
  subHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalContainer: {
    padding: 30,
    fontFamily: fonts.normal,
    color: colours.darkGray,
    height: 200,
    fontSize: 12,
  },
  scroll: {
    marginTop: 30,
    height: 500,
    width: '100%',
    overflow: 'scroll',
  },
  header: {
    fontFamily: fonts.bold,
    fontSize: fonts.lg,
    color: colours.gray,
    marginBottom: margin.md,
    marginLeft: margin.sm,
  },
  subHeader: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.md,
    color: colours.gray,
    marginLeft: margin.sm,
  },
  icon: {
    width: 50,
    height: 50,
  },
  expandBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    height: '15%',
    width: '100%',
  },

  detailsContainer: {
    height: '87%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: padding.lg,
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colours.white,
    elevation: elevation.md,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '15%',
    width: '100%',
    backgroundColor: colours.white,
  },
  infoContainer: {
    maxHeight: '20%',
    width: '100%',
    backgroundColor: colours.white,
    marginBottom: margin.md,
  },
  descContainer: {
    maxHeight: '70%',
    width: '100%',
    backgroundColor: colours.white,
    overflow: 'scroll',
  },
  normalText: {
    fontFamily: fonts.normal,
    fontSize: fonts.md,
    color: colours.gray,
  },
});

export default styles;
