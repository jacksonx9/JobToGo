import { StyleSheet } from 'react-native';

import {
  containers, padding, margin, elevation, border, colours, fonts,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: padding.md,
  },
  friendNavSection: {
    borderRadius: border.radius,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
    width: '95%',
    paddingHorizontal: padding.lg,
    marginHorizontal: margin.sm,
    marginBottom: margin.md,
    backgroundColor: colours.primary,
    elevation: elevation.md,
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
  listContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: colours.white,
  },
});

export default styles;
