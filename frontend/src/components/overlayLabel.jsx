import React from 'react'
import { View, Text } from 'react-native'
import { string } from 'prop-types'
import { overlayLabelStyles } from '../styles';


const OverlayLabel = ({ label, color }) => (
  <View style={[overlayLabelStyles.overlayLabel, { borderColor: color }]}>
    <Text style={[overlayLabelStyles.overlayLabelText, { color }]}>{label}</Text>
  </View>
);

OverlayLabel.propTypes = {
  label: string.isRequired,
  color: string.isRequired,
};

export default OverlayLabel;