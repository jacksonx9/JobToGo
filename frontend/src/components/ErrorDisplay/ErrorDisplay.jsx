import React from 'react';
import { View } from 'react-native';
import {
  string, bool, func, object,
} from 'prop-types';

import Button from '../Button';
import InfoDisplay from '../InfoDisplay';
import images from '../../constants/images';
import { colours } from '../../styles';


const ErrorDisplay = ({
  showDisplay, setShowDisplay, displayText, style,
}) => {
  if (!showDisplay) {
    return <View />;
  }

  return (
    <InfoDisplay
      message={displayText}
      source={images.iconLogoGraySad}
      style={style}
      button={(
        <Button
          backgroundColor={colours.accentPrimary}
          title="Back"
          textColor={colours.white}
          onPress={() => setShowDisplay(false)}
        />
      )}
    />
  );
};

ErrorDisplay.defaultProps = {
  style: {},
};

ErrorDisplay.propTypes = {
  showDisplay: bool.isRequired,
  setShowDisplay: func.isRequired,
  displayText: string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  style: object,
};

export default ErrorDisplay;
