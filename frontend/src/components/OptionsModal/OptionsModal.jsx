import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  string, bool, func, number,
} from 'prop-types';
import Modal from 'react-native-modal';

import IconButton from '../IconButton';
import styles from './styles';
import icons from '../../constants/icons';

const OptionsModal = ({
  option1, onPress1, option2, onPress2, isVisible, onPressExit, index,
}) => (
  <Modal isVisible={isVisible}>
    <View style={styles.modalContainer}>
      <View
        style={styles.exitButtonContainer}
        testID="optionModal"
      >
        <IconButton
          name={icons.x}
          size={icons.md}
          onPress={onPressExit}
        />
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => onPress1(index)}
        >
          <Text style={styles.optionText}>{option1}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => onPress2(index)}
        >
          <Text style={styles.optionText}>{option2}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

OptionsModal.propTypes = {
  option1: string.isRequired,
  option2: string.isRequired,
  onPress1: func.isRequired,
  onPress2: func.isRequired,
  isVisible: bool.isRequired,
  onPressExit: func.isRequired,
  index: number.isRequired,
};

export default OptionsModal;
