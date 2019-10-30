import { StyleSheet } from 'react-native';

import colours from '../constants/colours';
import fonts from '../constants/fonts';

export const signInStyles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.blue,
  },
  formStyle: {
    paddingTop: 100,
    height: '100%',
    width: '80%',
    position: 'absolute',
  },
  imageStyle: {
    height: 100,
    width: '100%',
    marginBottom: 40,
  },
  inputStyle: {
    height: 50,
    width: '100%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'white',
    backgroundColor: colours.darkBlue,
    fontFamily: fonts.normal,
  },
  buttonStyle: {
    marginTop: 5,
    marginBottom: 20,
    width: '100%',
    height: 50,
  },
  linkStyle: {
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white',
  },
});

export const signUpStyles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.blue,
  },
  formStyle: {
    paddingTop: 100,
    height: '100%',
    width: '80%',
    position: 'absolute',
  },
  imageStyle: {
    height: 100,
    width: '100%',
    marginBottom: 40,
  },
  inputStyle: {
    height: 50,
    width: '100%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'white',
    backgroundColor: colours.darkBlue,
    fontFamily: fonts.normal,
  },
  buttonStyle: {
    marginTop: 5,
    marginBottom: 20,
    width: '100%',
    height: 50,
  },
  linkStyle: {
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white',
  },
});

export const jobSwipeStyles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'white',
    height: '100%',
    width: '100%',
  },
});

export const sendLikedJobsStyles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  formStyle: {
    paddingTop: 100,
    height: '100%',
    width: '80%',
    position: 'absolute',
  },
  imageStyle: {
    height: 100,
    width: '100%',
    marginBottom: 40,
  },
  inputStyle: {
    height: 50,
    width: '100%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'white',
    backgroundColor: colours.darkBlue,
    fontFamily: fonts.normal,
  },
  buttonStyle: {
    marginTop: 5,
    marginBottom: 20,
  },
  linkStyle: {
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white',
  },
});

export const editFriendsStyles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  searchBarStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 65,
    width: '90%',
  },
  dividerStyle: {
    height: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formStyle: {
    paddingTop: 100,
    height: '100%',
    width: '80%',
    position: 'absolute',
  },
  imageStyle: {
    height: 100,
    width: '100%',
    marginBottom: 40,
  },
  inputStyle: {
    height: 50,
    width: '70%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: colours.darkGray,
    backgroundColor: colours.lighterGray,
    fontFamily: fonts.normal,
  },
  buttonStyle: {
    marginTop: 5,
    marginBottom: 20,
    width: '20%',
  },
  linkStyle: {
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white',
  },
});


export const editSkillsStyles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  buttonStyle: {
    marginTop: 50,
    marginBottom: 20,
    width: '50%',
    height: 70,
    backgroundColor: colours.blue,
  },
});

export const selectableItemStyles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 80,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colours.lightGray,
    backgroundColor: 'white',
  },
  infoContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailStyle: {
    height: 50,
    width: 50,
    borderRadius: 50,
    marginRight: 15,
  },
  textStyle: {
    fontFamily: fonts.normal,
  },
  headerStyle: {
    fontSize: 14,
    color: colours.darkGray,
  },
  subHeaderStyle: {
    fontSize: 12,
    color: colours.gray,
  },
  iconStyle: {
    fontSize: 14,
    color: colours.gray,
  },
  infoStyle: {
    flexDirection: 'column',
    flex: 1,
  },
});

export const buttonStyles = StyleSheet.create({
  containerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 50,
  },
  textStyle: {
    fontSize: 16,
  },
});

export const imageButtonStyles = StyleSheet.create({
  containerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const jobDetailsStyles = StyleSheet.create({
  containerStyle: {
    paddingTop: 15,
    justifyContent: 'center',
    height: 100,
    overflow: 'scroll',
    backgroundColor: 'white',
    zIndex: 10000,
  },
  textContainerStyle: {
    paddingVertical: 7,
    paddingHorizontal: 30,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: 100,
    overflow: 'scroll',
  },
  subHeaderContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalContainerStyle: {
    padding: 30,
    fontFamily: fonts.normal,
    color: colours.darkGray,
    height: '100%',
    fontSize: 12,
    backgroundColor: 'white',
  },
  scrollStyle: {
    marginTop: 30,
    height: 500,
    width: '100%',
    overflow: 'scroll',
  },
  headerStyle: {
    fontSize: 20,
    color: colours.darkGray,
    fontFamily: fonts.normal,
    paddingBottom: 7,
  },
  subHeaderStyle: {
    fontSize: 15,
    color: colours.gray,
    fontFamily: fonts.normal,
    paddingLeft: 6,
  },
  iconStyle: {
    width: 50,
    height: 50,
  },
});

export const jobImageStyles = StyleSheet.create({
  containerStyle: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 420,
  },
  textStyle: {
    textAlign: 'center',
    fontSize: 50,
    color: 'white',
  },
});

export const loaderStyles = StyleSheet.create({
  containerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    height: `${100}%`,
    backgroundColor: colours.blue,
  },
  imageStyle: {
    height: 140,
    width: 80,
  },
});

export const mainHeaderStyles = StyleSheet.create({
  containerStyle: {
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white',
    width: '100%',
  },
  logoStyle: {
    width: 170,
    height: 50,
  },
});

export const navHeaderStyles = StyleSheet.create({
  containerStyle: {
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white',
    width: '100%',
  },

  containerStyle2: {
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: '45%',
    height: 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white',
    width: '100%',
  },
  logoStyle: {
    width: 170,
    height: 50,
  },
  textStyle: {
    fontFamily: fonts.normal,
    color: colours.darkGray,
    fontSize: 16,
  },
});
