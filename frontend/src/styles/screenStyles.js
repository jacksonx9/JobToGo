import { StyleSheet } from 'react-native';

import colours from '../constants/colours';
import fonts from '../constants/fonts';

export const authStyles = StyleSheet.create({
  image: {
    height: 100,
    width: '100%',
    marginBottom: 40,
  },
  button: {
    marginTop: 5,
    marginBottom: 20,
    width: '100%',
    height: 50,
  },
});

export const jobSwipeStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
    width: '100%',
  },
});

export const editFriendsStyles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 65,
    width: '90%',
  },
  divider: {
    height: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 100,
    width: '100%',
    marginBottom: 40,
  },
  input: {
    height: 50,
    width: '70%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: colours.darkGray,
    backgroundColor: colours.lighterGray,
    fontFamily: fonts.normal,
  },
  button: {
    marginTop: 5,
    marginBottom: 20,
    width: '20%',
  },
});

export const editSkillsStyles = StyleSheet.create({
  button: {
    marginTop: 50,
    marginBottom: 20,
    width: '50%',
    height: 70,
    backgroundColor: colours.blue,
  },
});

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
