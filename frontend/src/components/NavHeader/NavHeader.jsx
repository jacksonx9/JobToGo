import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

import SearchBar from '../SeachBar';
import ImageButton from '../ImageButton';
import images from '../../constants/images';
import styles from './styles';

const NavHeader = ({
  title, searchEnabled, value, onChangeText, onStartSearch, onEndSearch, onGoBack,
}) => (
  <View style={styles.container}>
    <View style={styles.componentContainer}>
      <View style={styles.leftComponentContainer}>
        {searchEnabled
          ? (
            <SearchBar
              value={value}
              onChangeText={onChangeText}
              onStartSearch={onStartSearch}
              onEndSearch={onEndSearch}
            />
          )
          : (
            <ImageButton
              source={images.iconChevronLeft}
              onPress={onGoBack}
            />
          )}
      </View>
      <ImageButton
        source={images.iconMenu}
        onPress={onGoBack}
      />
    </View>
    <View
      style={styles.titleContainer}
    >
      <Text style={styles.text}>{title}</Text>
    </View>
  </View>

);

NavHeader.propTypes = {
  title: PropTypes.string.isRequired,
};

export default NavHeader;
