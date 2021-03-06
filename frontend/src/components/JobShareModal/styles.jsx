import { StyleSheet } from 'react-native';

import {
  padding, colours, border, margin, fonts,
} from '../../styles';

const LOGO_SIZE = 200;
const styles = StyleSheet.create({
  modalContainer: {
    height: '90%',
    width: '100%',
    backgroundColor: colours.white,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: border.radius,
    zIndex: 1000,
  },
  listContainer: {
    height: '65%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  exitButtonContainer: {
    height: 40,
    width: '100%',
    marginBottom: margin.xs,
    padding: padding.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sectionTitleContainer: {
    height: 40,
    width: '100%',
    marginVertical: margin.xs,
    paddingHorizontal: padding.xxl,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fonts.lg,
    color: colours.primary,
  },
  errorDisplay: {
    height: '100%',
    borderRadius: border.radius,
  },
});

export default styles;
export { LOGO_SIZE };
