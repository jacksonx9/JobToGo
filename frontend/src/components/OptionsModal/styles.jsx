import { StyleSheet } from 'react-native';

import {
  padding, colours, border, margin, fonts,
} from '../../styles';

const styles = StyleSheet.create({
  modalContainer: {
    height: '32%',
    width: '98%',
    backgroundColor: colours.white,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: border.radius,
    zIndex: 1000,
  },
  exitButtonContainer: {
    height: 40,
    width: '100%',
    marginBottom: margin.xs,
    padding: padding.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    height: '70%',
    width: '100%',
    marginVertical: margin.xs,
    paddingHorizontal: padding.ms,
    justifyContent: 'center',
    alignItems: 'center',
  },
  option: {
    height: '35%',
    width: '100%',
    marginVertical: margin.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontFamily: fonts.bold,
    fontSize: fonts.md,
    color: colours.primary,
  },
});

export default styles;
