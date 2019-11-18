import React from 'react';
import { View, TextInput } from 'react-native';
import { string, func } from 'prop-types';

import IconButton from '../IconButton';
import images from '../../constants/images';
import styles from './styles';
import { colours, sizes } from '../../styles';

const SearchBar = ({ value, onChangeText, onEndSearch }) => (
  <View style={styles.container}>
    <IconButton
      name="chevron-left"
      color={colours.lightGray}
      size={sizes.icon}
      onPress={onEndSearch}
    />
    <TextInput
      placeholder="Search"
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

SearchBar.propTypes = {
  value: string.isRequired,
  onChangeText: func.isRequired,
  onEndSearch: func.isRequired,
};

export default SearchBar;
