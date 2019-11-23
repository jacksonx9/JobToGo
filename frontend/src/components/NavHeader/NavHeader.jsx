import React from 'react';
import { View, Text } from 'react-native';
import { string, func, oneOf } from 'prop-types';

import IconButton from '../IconButton';
import styles from './styles';
import { colours, sizes } from '../../styles';

const NavHeader = ({
  title, buttonOption, onPressButton, navigation, testID,
}) => {
  let button;
  if (buttonOption === 'search') {
    button = (
      <IconButton
        testID="search"
        name="search"
        color={colours.lightGray}
        size={sizes.icon}
        onPress={onPressButton}
      />
    );
  } else if (buttonOption === 'back') {
    button = (
      <IconButton
        name="menu"
        color={colours.lightGray}
        size={sizes.icon}
        onPress={onPressButton}
      />
    );
  } else {
    button = null;
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.componentContainer}>
        <View style={styles.leftComponentContainer}>
          {button}
        </View>
        <IconButton
          testID="user"
          name="user"
          color={colours.lightGray}
          size={sizes.icon}
          onPress={ () => navigation.navigate('Profile')}
        />
      </View>
      <View
        style={styles.titleContainer}
      >
        <Text style={styles.text} testID="navTitle">{title}</Text>
      </View>
    </View>
  );
};

NavHeader.defaultProps = {
  buttonOption: 'none',
  onPressButton: () => {},
  testID: '',
};

NavHeader.propTypes = {
  title: string.isRequired,
  buttonOption: oneOf(['search', 'back', 'none']),
  onPressButton: func,
  testID: string,
};

export default NavHeader;
