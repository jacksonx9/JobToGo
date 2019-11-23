import React from 'react';
import { View, Text } from 'react-native';
import { string, func, oneOf } from 'prop-types';

import IconButton from '../IconButton';
import styles from './styles';
import { colours, sizes } from '../../styles';

const NavHeader = ({
  title, leftButtonOption, onPressLeftButton, rightButtonOption,
  onPressRightButton, testID,
}) => {
  let leftButton;
  if (leftButtonOption === 'search') {
    leftButton = (
      <IconButton
        testID="search"
        name="search"
        color={colours.lightGray}
        size={sizes.icon}
        onPress={onPressLeftButton}
      />
    );
  } else if (leftButtonOption === 'back') {
    leftButton = (
      <IconButton
        name="chevron-left"
        color={colours.lightGray}
        size={sizes.icon}
        onPress={onPressLeftButton}
      />
    );
  } else {
    leftButton = null;
  }

  let rightButton;
  if (rightButtonOption === 'menu') {
    rightButton = (
      <IconButton
        testID="menu"
        name="menu"
        color={colours.lightGray}
        size={sizes.icon}
        onPress={onPressRightButton}
      />
    );
  } else {
    rightButton = null;
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.componentContainer}>
        <View style={styles.leftComponentContainer}>
          {leftButton}
        </View>
        <View>
          {rightButton}
        </View>
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
  leftButtonOption: 'none',
  onPressLeftButton: () => {},
  rightButtonOption: 'none',
  onPressRightButton: () => {},
  testID: '',
};

NavHeader.propTypes = {
  title: string.isRequired,
  leftButtonOption: oneOf(['search', 'back', 'none']),
  onPressLeftButton: func,
  rightButtonOption: oneOf(['menu', 'none']),
  onPressRightButton: func,
  testID: string,
};

export default NavHeader;
