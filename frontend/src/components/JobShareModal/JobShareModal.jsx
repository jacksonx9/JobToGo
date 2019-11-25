import React from 'react';
import { View, Text, FlatList } from 'react-native';
import {
  string, bool, func, arrayOf, object,
} from 'prop-types';
import Modal from 'react-native-modal';

import ErrorDisplay from '../ErrorDisplay';
import SelectableItem from '../SelectableItem';
import ImageButton from '../ImageButton';
import images from '../../constants/images';
import { colours } from '../../styles';
import styles from './styles';
import icons from '../../constants/icons';

const JobShareModal = ({
  isVisible, onPressExit, jobTitle, jobCompany, jobId, jobLogo, friends, onPressSend, extraData,
  showErrorDisplay, setShowErrorDisplay, errorDisplayText,
}) => {
  const modalContent = showErrorDisplay ? (
    <ErrorDisplay
      showDisplay={showErrorDisplay}
      setShowDisplay={setShowErrorDisplay}
      displayText={errorDisplayText}
      style={styles.errorDisplay}
    />
  ) : (
    <View style={styles.modalContainer}>
      <View
        style={styles.exitButtonContainer}
        testID="shareModal"
      >
        <ImageButton
          testID="closeShare"
          source={images.iconCross}
          onPress={onPressExit}
        />
      </View>
      <SelectableItem
        header={jobTitle}
        subHeader={jobCompany}
        onPress={() => {}}
        noButton
        imageSource={jobLogo}
        backgroundColor={colours.primary}
        titleColor={colours.white}
        descriptionColor={colours.secondary}
      />
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Share this Job with Friends</Text>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={friends}
          keyExtractor={item => item._id}
          extraData={extraData}
          renderItem={({ item, index }) => (
            <SelectableItem
              key={item._id}
              header={item.userName}
              subHeader={item.sharedJob ? 'shared' : 'not shared'}
              iconName={icons.send}
              onPress={() => onPressSend(item, jobId, index)}
              noButton={item.sharedJob}
            />
          )}
        />
      </View>
    </View>
  );

  return (
    <Modal
      isVisible={isVisible}
    >
      <View style={styles.modalContainer}>
        { modalContent }
      </View>
    </Modal>
  );
};

JobShareModal.defaultProps = {
  jobLogo: null,
};

JobShareModal.propTypes = {
  isVisible: bool.isRequired,
  onPressExit: func.isRequired,
  jobTitle: string.isRequired,
  jobCompany: string.isRequired,
  jobId: string.isRequired,
  jobLogo: string,
  friends: arrayOf(object).isRequired,
  onPressSend: func.isRequired,
  extraData: object.isRequired, // eslint-disable-line react/forbid-prop-types
  showErrorDisplay: bool.isRequired,
  setShowErrorDisplay: func.isRequired,
  errorDisplayText: string.isRequired,
};

export default JobShareModal;
