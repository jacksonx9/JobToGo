import React from 'react';
import { View, TextInput } from 'react-native';
import { string, func } from 'prop-types';

import ImageButton from '../ImageButton';
import images from '../../constants/images';
import styles from './styles';

const SearchBar = ({ value, onChangeText, onEndSearch }) => (
  <View style={styles.container}>
    <ImageButton
      source={images.iconChevronLeft}
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
