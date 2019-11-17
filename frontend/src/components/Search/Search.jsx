import React from 'react';
import { View } from 'react-native';
import { string, func, element } from 'prop-types';

import SearchBar from '../SearchBar';
import styles from './styles';

const Search = ({
  value, onChangeText, onEndSearch, children,
}) => (

  <View style={styles.container}>
    <SearchBar
      value={value}
      onChangeText={onChangeText}
      onEndSearch={onEndSearch}
    />
    <View style={styles.listContainer}>
      {children}
    </View>
  </View>
);

Search.propTypes = {
  value: string.isRequired,
  onChangeText: func.isRequired,
  onEndSearch: func.isRequired,
  children: element.isRequired,
};

export default Search;
