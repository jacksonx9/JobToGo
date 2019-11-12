import { StyleSheet } from 'react-native';

import { padding, border, colours } from '../../styles';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: padding.lg,
    height: 270,
    width: '100%',
    backgroundColor: colours.white,
  },
  companyLogo: {
    height: 200,
    width: 200,
    borderRadius: border.radius,
  },
});

export default styles;
