import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../constants'

const SelectableItem = ({ header, subHeader, onPress }) => {
  
    return (
        <View style={[styles.containerStyle]}>

            <View style={[styles.infoStyle]}>
                <Text>{header}</Text>
                <Text>{subHeader}</Text>
            </View>

            <TouchableOpacity
                onPress={onPress}
            >
                <Text>x</Text>
            </TouchableOpacity>
        </View>
    );
    
  }

const styles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 80,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white'
  },
  textStyle: {
    fontSize: 16,
    fontFamily: fonts.normal
  },
  infoStyle: {
    flexDirection: 'column',
    flex: 1
  }
});

export { SelectableItem };
