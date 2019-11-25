import { StyleSheet } from 'react-native';

import {
  containers, padding, margin, elevation, fonts, colours,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: padding.xxl,
  },
  buttonRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSection: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: colours.accentPrimary,
    zIndex: 4,
    elevation: elevation.sm,
    marginLeft: margin.sm,
    marginRight: margin.sm,
  },
  image: {
    resizeMode: 'contain',
    maxHeight: '45%',
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: fonts.md,
    color: colours.lightGray,
    textAlign: 'center',
    marginBottom: '10%',
  },
});

export default styles;
