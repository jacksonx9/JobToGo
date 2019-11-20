import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { string, bool, func } from 'prop-types';

import styles from './styles';

const SwitchableNav = ({
  showNavOption1, navOption1Title, navOption2Title, onPressNavOption1, onPressNavOption2,
}) => (
  <View style={[styles.container]} testID="switchNav">
    <TouchableOpacity
      testID="switchNavOption1"
      style={styles.navOptionContainer}
      onPress={onPressNavOption1}
    >
      <Text style={showNavOption1 ? styles.accentText : styles.mutedText}>
        {navOption1Title}
      </Text>
      <Text style={styles.accentDot}>
        {showNavOption1 ? '.' : ''}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      testID="switchNavOption2"
      style={styles.navOptionContainer}
      onPress={onPressNavOption2}
    >
      <Text style={!showNavOption1 ? styles.accentText : styles.mutedText}>
        {navOption2Title}
      </Text>
      <Text style={styles.accentDot}>
        {!showNavOption1 ? '.' : ''}
      </Text>
    </TouchableOpacity>
  </View>
);


SwitchableNav.propTypes = {
  showNavOption1: bool.isRequired,
  navOption1Title: string.isRequired,
  navOption2Title: string.isRequired,
  onPressNavOption1: func.isRequired,
  onPressNavOption2: func.isRequired,
};

export default SwitchableNav;
