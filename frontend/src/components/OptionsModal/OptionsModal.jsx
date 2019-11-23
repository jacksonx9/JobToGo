import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  string, bool, func, arrayOf, object,
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

OptionsModal.defaultProps = {
  jobLogo: null,
};

OptionsModal.propTypes = {
  isVisible: bool.isRequired,
  onPressExit: func.isRequired,
  jobTitle: string.isRequired,
  jobCompany: string.isRequired,
  jobId: string.isRequired,
  jobLogo: string,
  friends: arrayOf(object).isRequired,
  onPressSend: func.isRequired,
};

export default OptionsModal;
