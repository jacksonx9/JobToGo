import React from 'react';
import { Text, TouchableOpacity, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';

const Button = ({
  style, backgroundColor, textColor, title, enable, onPress, testID,
}) => (
  <TouchableOpacity
    testID={testID}
    style={[{
      opacity: enable ? 1 : 0.3,
      backgroundColor,
    }, styles.container, style]}
    disabled={!enable}
    onPress={onPress}
  >
    <Text style={[{ color: textColor }, styles.text]}>
      {title}
    </Text>
  </TouchableOpacity>
);

Button.defaultProps = {
  style: [],
  backgroundColor: 'black',
  textColor: 'white',
  enable: true,
  testID: '',
};

Button.propTypes = {
  style: ViewPropTypes.style,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  title: PropTypes.string.isRequired,
  enable: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  testID: PropTypes.string,
};

export default Button;
