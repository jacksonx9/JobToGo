import { StyleSheet } from 'react-native';

import {
  containers, padding, margin, elevation, border, colours,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    justifyContent: 'center',
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
    height: '65%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colours.white,
  },
  errorDisplay: {
    position: 'absolute',
  },
});

export default styles;
