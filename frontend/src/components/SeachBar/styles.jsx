
import { StyleSheet } from 'react-native';

import {
  padding, margin, colours, fonts, border,
} from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 80,
    width: '100%',
    paddingTop: padding.md,
    marginBottom: margin.md,
    backgroundColor: 'transparent',
  },
  input: {
    height: 50,
    width: '90%',
    marginVertical: 5,
    paddingHorizontal: 10,
    color: colours.gray,
    fontFamily: fonts.normal,
    fontSize: fonts.md,
    borderBottomColor: colours.gray,
    borderBottomWidth: border.inputBorderWidth,
  },
});

export default styles;
