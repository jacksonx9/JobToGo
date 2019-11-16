import { StyleSheet } from 'react-native';

import { colours, fonts, padding } from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: padding.sm,
    height: '80%',
    width: '100%',
    backgroundColor: colours.white,
  },
  image: {
    maxHeight: '30%',
    maxWidth: '30%',
    resizeMode: 'contain',
    marginBottom: '10%',
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.lg,
    color: colours.lightGray,
    textAlign: 'center',
  },
});

export default styles;