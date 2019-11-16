import React from 'react';
import { View, Text, FlatList } from 'react-native';
import {
  string, bool, func, arrayOf,
} from 'prop-types';
import Modal from 'react-native-modal';

import SelectableItem from '../SelectableItem';
import ImageButton from '../ImageButton';
import images from '../../constants/images';
import { colours } from '../../styles';
import styles from './styles';

const JobShareModal = ({
  isVisible, onPressExit, jobTitle, jobCompany, jobId, friends, onPressSend,
}) => (
  <Modal
    isVisible={isVisible}
  >
    <View style={styles.modalContainer}>
      <View style={styles.exitButtonContainer}>
        <ImageButton
          source={images.iconCross}
          onPress={onPressExit}
        />
      </View>
      <SelectableItem
        header={jobTitle}
        subHeader={jobCompany}
        onPress={() => {}}
        actionIcon=""
        disabled
        backgroundColor={colours.primary}
        titleColor={colours.white}
        descriptionColor={colours.secondary}
      />
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Share this Job with Friends</Text>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={friends}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <SelectableItem
              key={item._id}
              header={item.userName}
              subHeader={item.email}
              onPress={() => onPressSend(item, jobId)}
              actionIcon="+"
            />
          )}
        />
      </View>
    </View>
  </Modal>
);

JobShareModal.propTypes = {
  isVisible: bool.isRequired,
  onPressExit: func.isRequired,
  jobTitle: string.isRequired,
  jobCompany: string.isRequired,
  jobId: string.isRequired,
  friends: arrayOf(string).isRequired,
  onPressSend: func.isRequired,
};

export default JobShareModal;
