
import { StyleSheet } from 'react-native';

import {
  dimensions, padding, margin, colours, fonts,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    width: dimensions.fullWidth,
    paddingTop: padding.lg,
    paddingHorizontal: padding.md,
    marginBottom: margin.md,
    backgroundColor: 'transparent',
  },
  leftComponentContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '85%',
  },
  componentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
    width: '100%',
    paddingTop: padding.md,
    marginBottom: margin.md,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 60,
    width: '100%',
    paddingHorizontal: padding.xxl,
    backgroundColor: 'transparent',
  },
  text: {
    fontFamily: fonts.extraBold,
    color: colours.primary,
    fontSize: fonts.lg,
  },
});

export default styles;