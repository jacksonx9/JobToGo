import React, { Component } from 'react';
import { View, TextInput } from 'react-native';
import { string, func } from 'prop-types';

import ImageButton from '../ImageButton';
import images from '../../constants/images';
import styles from './styles';

class SearchBar extends Component {
  startSearch = () => {
    const { onStartSearch } = this.props;
    onStartSearch();
  }

  endSearch = () => {
    const { onEndSearch } = this.props;
    onEndSearch();
  }

  render() {
    const { value, onChangeText } = this.props;
    return (
      <View style={styles.container}>
        <ImageButton
          source={images.iconChevronLeft}
          onPress={this.endSearch}
        />
        <TextInput
          placeholder="Search"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    );
  }
}

SearchBar.propTypes = {
  value: string.isRequired,
  onChangeText: func.isRequired,
  onStartSearch: func.isRequired,
  onEndSearch: func.isRequired,
};

export default SearchBar;
