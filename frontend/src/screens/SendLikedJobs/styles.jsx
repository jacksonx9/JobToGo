import { StyleSheet } from 'react-native';

import {
  containers, padding, elevation, colours, fonts,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: padding.md,
  },
  buttonSection: {
    height: 60,
    width: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    bottom: '2%',
    right: '10%',
    borderRadius: 50,
    backgroundColor: colours.accentPrimary,
    zIndex: 4,
    elevation: elevation.sm,
  },
  infoContainer: {
    width: '50%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    width: '50%',
  },
  button: {
    width: 100,
  },
  bigText: {
    fontSize: fonts.md,
    fontFamily: fonts.bold,
    color: colours.accentSecondary,
  },
  normalText: {
    fontSize: fonts.sm,
    fontFamily: fonts.bold,
    color: colours.secondary,
  },
  listContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '73%',
    width: '100%',
    backgroundColor: colours.white,
  },
});

export default styles;
