import { StyleSheet } from 'react-native';

import { colours, fonts, margin, padding, border, elevation } from '../../styles';

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    justifyContent: 'center',
    height: 150,
    width: '100%',
    overflow: 'scroll',
    backgroundColor: 'white',
  },
  textContainer: {
    paddingVertical: 7,
    paddingHorizontal: 30,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: 100,
    overflow: 'scroll',
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
    backgroundColor: 'black',
  },
  scroll: {
    marginTop: 30,
    height: 500,
    width: '100%',
    overflow: 'scroll',
  },
  header: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.md,
    color: colours.white,
    marginBottom: margin.sm,
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

  
  detailsContainer: {
    height: '85%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: padding.lg,
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colours.primary,
    elevation: elevation.md,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '15%',
    width: '100%',
    backgroundColor: colours.primary,
  },
  infoContainer: {
    maxHeight: '20%',
    width: '100%',
    backgroundColor: colours.primary,
    marginBottom: margin.md,
  },
  descContainer: {
    maxHeight: '70%',
    width: '100%',
    backgroundColor: colours.primary,
    overflow: 'scroll',
  },
  normalText: {
    fontFamily: fonts.normal,
    fontSize: fonts.md,
    color: colours.secondary,
  },
  headerDark: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.lg,
    color: colours.white,
    marginBottom: margin.sm,
    marginLeft: margin.sm,
  },
  subHeaderDark: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.md,
    color: colours.white,
    marginLeft: margin.sm,
  },
});

export default styles;
