import React from 'react';
import { View, Text } from 'react-native';
import { string, func, oneOf } from 'prop-types';

import SearchBar from '../SearchBar';
import ImageButton from '../ImageButton';
import images from '../../constants/images';
import styles from './styles';


const NavHeader = ({
  title, buttonOption, onPressButton, value, onChangeText, onStartSearch, onEndSearch,
}) => {
  let button;
  if (buttonOption === 'search') {
    button = (
      <ImageButton
        source={images.iconSearch}
        onPress={onPressButton}
      />
    );
  } else if (buttonOption === 'back') {
    button = (
      <ImageButton
        source={images.iconChevronLeft}
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
        <ImageButton
          source={images.iconMenu}
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
  value: '',
  onChangeText: () => {},
  onStartSearch: () => {},
  onEndSearch: () => {},
};

NavHeader.propTypes = {
  title: string.isRequired,
  buttonOption: oneOf(['search', 'back', 'none']),
  onPressButton: func,
  value: string,
  onChangeText: func,
  onStartSearch: func,
  onEndSearch: func,
};

export default NavHeader;
