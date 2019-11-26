import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { string, func, bool } from 'prop-types';

import IconButton from '../IconButton';
import JobImage from '../JobImage';
import { colours } from '../../styles';
import icons from '../../constants/icons';
import styles from './styles';

const SelectableItemLong = ({
  header, subHeader, onPress, enableSelect, onSelect,
  iconName, bannerText, // TODO: Possibly add buttonType, buttonText
  noButton, noBanner, imageSource, enableButton2, iconName2, onPress2,
  backgroundColor, titleColor, descriptionColor, testID,
}) => (
  <TouchableOpacity
    style={[styles.container, { backgroundColor }]}
    testID={testID}
    disabled={enableSelect}
    onPress={() => onSelect()}
  >
    <View style={styles.contentContainer}>
      <JobImage
        logo={imageSource}
        style={styles.logo}
        code={header}
      />
      <View style={styles.infoContainer}>
        <View style={styles.topLineContainer}>

          <View style={styles.titleContainer}>
            <Text
              numberOfLines={1}
              style={[styles.descriptionText, { color: titleColor }]}
            >
              {header}
            </Text>
          </View>
          {noBanner
            ? <View />
            : (
              <View style={styles.banner}>
                <Text
                  numberOfLines={1}
                  style={styles.bannerText}
                >
                  {bannerText}
                </Text>
              </View>
            )}
        </View>
        <Text
          numberOfLines={2}
          style={[styles.titleText, { color: descriptionColor }]}
        >
          {subHeader}
        </Text>
      </View>
    </View>
    {noButton ? <View />
      : (
        <View
          style={styles.buttonContainer}
        >
          <IconButton
            testID={`${testID}FirstButton`}
            name={iconName}
            color={colours.lightGray}
            size={icons.sm}
            onPress={onPress}
          />
          {enableButton2
            ? (
              <IconButton
                name={iconName2}
                color={colours.lightGray}
                size={icons.sm}
                onPress={onPress2}
              />
            ) : <View />}
        </View>
      )}
  </TouchableOpacity>
);

SelectableItemLong.defaultProps = {
  subHeader: '',
  iconName: icons.x,
  bannerText: '',
  enableButton2: false,
  iconName2: '',
  onPress2: () => {},
  noButton: false,
  noBanner: true,
  imageSource: null,
  backgroundColor: colours.white,
  titleColor: colours.primary,
  descriptionColor: colours.gray,
  testID: '',
};

SelectableItemLong.propTypes = {
  header: string.isRequired,
  subHeader: string,
  onPress: func.isRequired,
  iconName: string,
  bannerText: string,
  noButton: bool,
  noBanner: bool,
  enableButton2: bool,
  iconName2: string,
  onPress2: func,
  imageSource: string,
  backgroundColor: string,
  titleColor: string,
  descriptionColor: string,
  testID: string,
};

export default SelectableItemLong;
