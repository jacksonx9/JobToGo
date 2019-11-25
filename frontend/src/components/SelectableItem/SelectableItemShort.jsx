import React from 'react';
import { Text, View } from 'react-native';
import { string, func, bool } from 'prop-types';

import IconButton from '../IconButton';
import { colours } from '../../styles';
import icons from '../../constants/icons';
import styles from './styles';

const SelectableItemShort = ({
  header, onPress,
  iconName, bannerText,
  noButton, noBanner, enableButton2, iconName2, onPress2,
  backgroundColor, titleColor, descriptionColor, testID,
}) => (
  <View style={[styles.containerShort, { backgroundColor }]} testID={testID}>
    <View style={styles.contentContainer}>
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
      </View>
    </View>
    {noButton ? <View />
      : (
        <View
          style={styles.buttonContainer}
        >
          <IconButton
            testID={`${testID}Remove`}
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
  </View>
);

SelectableItemShort.defaultProps = {
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

SelectableItemShort.propTypes = {
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

export default SelectableItemShort;
