import { StyleSheet, Dimensions } from 'react-native';

import colours from '../constants/colours';
import fonts from '../constants/fonts';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
export const selectableItemStyles = StyleSheet.create({
  container: {
    justifyContent: 'space-evenly',
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colours.lightBlue,
    backgroundColor: colours.white,
  },
  thumbnail: {
    height: 50,
    width: 50,
    borderRadius: 10,
    marginRight: 15,
  },
  text: {
    fontFamily: fonts.normal,
  },
  header: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colours.gray,
  },
  subHeader: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colours.lightGray,
  },
  infoContainer: {
    width: '80%',
  },
  iconContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 70,
    width: '20%',
  },
  icon: {
    fontSize: 24,
    color: colours.lightGray,
  },
  info: {
    flexDirection: 'column',
    flex: 1,
  },
});

export const buttonStyles = StyleSheet.create({
  container: {
    borderRadius: 15,
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
    height: 100,
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
    height: 420,
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
    paddingLeft: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 80,
    position: 'absolute',
    top: 10,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 170,
    height: 50,
  },
  text: {
    fontFamily: fonts.extraBold,
    color: colours.white,
    fontSize: 22,
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
