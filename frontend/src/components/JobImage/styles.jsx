import { StyleSheet } from 'react-native';

import { padding, border } from '../../styles';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: padding.lg,
    height: 420,
  },
  companyLogo: {
    height: 200,
    width: 200,
    borderRadius: border.radius,
  },
});

export default styles;
