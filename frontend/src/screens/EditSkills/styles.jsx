import { StyleSheet } from 'react-native';

import {
  containers, padding, margin,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    ...containers.fullScreenContainer,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: padding.xxl,
  },
  button: {
    width: '100%',
    marginTop: margin.md,
    marginBottom: margin.sm,
  },
});

export default styles;
