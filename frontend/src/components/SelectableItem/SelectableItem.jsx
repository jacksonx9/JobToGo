import React from 'react';
import {
  Text, View,
} from 'react-native';
import { string, func, bool } from 'prop-types';

import IconButton from '../IconButton';
import JobImage from '../JobImage';
import { colours } from '../../styles';
import icons from '../../constants/icons';
import styles from './styles';


// const SelectableItem = ({
//   showNavOption1, navOption1Title, navOption2Title, onPressNavOption1, onPressNavOption2,
// }) => (
//   <View style={[styles.container]} testID="switchNav">
//     <TouchableOpacity
//       testID="switchNavOption1"
//       style={styles.navOptionContainer}
//       onPress={onPressNavOption1}
//     >
//       <Text style={showNavOption1 ? styles.accentText : styles.mutedText}>
//         {navOption1Title}
//       </Text>
//       <Text style={styles.accentDot}>
//         {showNavOption1 ? '.' : ''}
//       </Text>
//     </TouchableOpacity>

//     <TouchableOpacity
//       testID="switchNavOption2"
//       style={styles.navOptionContainer}
//       onPress={onPressNavOption2}
//     >
//       <Text style={!showNavOption1 ? styles.accentText : styles.mutedText}>
//         {navOption2Title}
//       </Text>
//       <Text style={styles.accentDot}>
//         {!showNavOption1 ? '.' : ''}
//       </Text>
//     </TouchableOpacity>
//   </View>
// );


// SwitchableNav.propTypes = {
//   showNavOption1: bool.isRequired,
//   navOption1Title: string.isRequired,
//   navOption2Title: string.isRequired,
//   onPressNavOption1: func.isRequired,
//   onPressNavOption2: func.isRequired,
// };

// export default SwitchableNav;


const SelectableItem = ({
  header, subHeader, onPress, buttonType, buttonText, iconName, bannerText, noButton, noBanner, imageSource,
  backgroundColor, titleColor, descriptionColor,
}) => (
  <View style={[styles.container, { backgroundColor }]} testID="DO NOT MERGE">
    <View style={styles.contentContainer}>
      <JobImage
        logo={imageSource}
        style={styles.logo}
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
          style={[styles.buttonContainer]}
        >
          <IconButton
            name={iconName}
            color={colours.lightGray}
            size={icons.sm}
            onPress={onPress}
          />
        </View>
      )}
  </View>
);

SelectableItem.defaultProps = {
  subHeader: '',
  iconName: icons.x,
  bannerText: '',
  noButton: false,
  noBanner: true,
  imageSource: null,
  backgroundColor: colours.white,
  titleColor: colours.primary,
  descriptionColor: colours.gray,
  testID: '',
};

SelectableItem.propTypes = {
  header: string.isRequired,
  subHeader: string,
  onPress: func.isRequired,
  iconName: string,
  bannerText: string,
  noButton: bool,
  noBanner: bool,
  imageSource: string,
  backgroundColor: string,
  titleColor: string,
  descriptionColor: string,
  testID: string,
};

export default SelectableItem;
