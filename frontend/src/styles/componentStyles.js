import { StyleSheet } from 'react-native';

import colours from '../constants/colours';
import fonts from '../constants/fonts';

export const selectableItemStyles = StyleSheet.create({
  container: {
    justifyContent: 'space-evenly',
    height: 80,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colours.lightGray,
    backgroundColor: 'white',
  },
  thumbnail: {
    height: 50,
    width: 50,
    borderRadius: 50,
    marginRight: 15,
  },
  text: {
    fontFamily: fonts.normal,
  },
  header: {
    fontSize: 14,
    color: colours.darkGray,
  },
  subHeader: {
    fontSize: 12,
    color: colours.gray,
  },
  icon: {
    fontSize: 14,
    color: colours.gray,
  },
  info: {
    flexDirection: 'column',
    flex: 1,
  },
});

export const buttonStyles = StyleSheet.create({
  container: {
    borderRadius: 5,
    height: 50,
  },
  text: {
    fontSize: 16,
  },
});

export const jobDetailsStyles = StyleSheet.create({
  container: {
    paddingTop: 15,
    justifyContent: 'center',
    height: 170,
    overflow: 'scroll',
    backgroundColor: 'white',
  },
  textContainer: {
    paddingVertical: 7,
    paddingHorizontal: 30,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: 170,
    overflow: 'hidden',
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
    height: '100%',
    fontSize: 12,
    backgroundColor: 'white',
  },
  scroll: {
    marginTop: 30,
    height: 500,
    width: '100%',
    overflow: 'scroll',
  },
  header: {
    fontSize: 20,
    color: colours.darkGray,
    fontFamily: fonts.normal,
    paddingBottom: 7,
  },
  subHeader: {
    fontSize: 15,
    color: colours.gray,
    fontFamily: fonts.normal,
    paddingLeft: 6,
  },
  icon: {
    width: 50,
    height: 50,
  },
});

export const jobImageStyles = StyleSheet.create({
  container: {
    padding: 30,
    height: 370,
    borderRadius: 5,
  },
  companyLogo: {
    height: 200,
    width: 200,
    borderRadius: 15,
  },
});

export const loaderStyles = StyleSheet.create({
  image: {
    height: 140,
    width: 80,
  },
});

export const mainHeaderStyles = StyleSheet.create({
  container: {
    paddingTop: 5,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    width: 170,
    height: 50,
  },
});

export const navHeaderStyles = StyleSheet.create({
  mainContainer: {
    paddingTop: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  contentContainer: {
    paddingTop: 5,
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: '45%',
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    width: 170,
    height: 50,
  },
  text: {
    fontFamily: fonts.normal,
    color: colours.darkGray,
    fontSize: 16,
  },
});

export const overlayLabelStyles = StyleSheet.create({
  overlayLabel: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
  },
  overlayLabelText: {
    fontSize: 25,
    fontFamily: fonts.normal,
    textAlign: 'center',
  },
  overlayDislike: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 30,
    marginLeft: -30,
  },
  overlayLike: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 30,
    marginLeft: 30,
  },
});
