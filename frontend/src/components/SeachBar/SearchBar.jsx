import React, { Component } from 'react';
import { View, TextInput } from 'react-native';
import { string, func } from 'prop-types';

import ImageButton from '../ImageButton';
import images from '../../constants/images';
import styles from './styles';

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showInput: false,
    };
  }

  startSearch = () => {
    const { onStartSearch } = this.props;
    onStartSearch();
    this.setState({ showInput: true });
  }

  endSearch = () => {
    const { onEndSearch } = this.props;
    onEndSearch();
    this.setState({ showInput: false });
  }

  render() {
    const { showInput } = this.state;
    const { value, onChangeText } = this.props;
    if (showInput) {
      return (
        <View style={[styles.container]}>
          <ImageButton
            source={images.iconChevronLeft}
            onPress={this.endSearch}
          />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
          />
        </View>
      );
    }

    return (
      <View style={[styles.container]}>
        <ImageButton
          source={images.iconSendColoured}
          onPress={this.startSearch}
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
