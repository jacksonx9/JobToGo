import React from 'react';
import { View, Text } from 'react-native';
import { string, func, oneOf } from 'prop-types';

import IconButton from '../IconButton';
import styles from './styles';
import { colours, sizes } from '../../styles';


const NavHeader = ({
  title, buttonOption, onPressButton,
}) => {
  let button;
  if (buttonOption === 'search') {
    button = (
      <IconButton
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
    <View style={styles.container}>
      <View style={styles.componentContainer}>
        <View style={styles.leftComponentContainer}>
          {button}
        </View>
        <IconButton
          name="user"
          color={colours.lightGray}
          size={sizes.icon}
          onPress={onPressButton}
        />
      </View>
      <View
        style={styles.titleContainer}
      >
        <Text style={styles.text}>{title}</Text>
      </View>
    </View>
  );
};

NavHeader.defaultProps = {
  buttonOption: 'none',
  onPressButton: () => {},
};

NavHeader.propTypes = {
  title: string.isRequired,
  buttonOption: oneOf(['search', 'back', 'none']),
  onPressButton: func,
};

export default NavHeader;
