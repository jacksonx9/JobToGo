import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import { fonts, images, colours } from '../constants'

const SelectableItem = ({ header, subHeader, onPress }) => {
  
    return (
        <View style={[styles.containerStyle]}>
            <View style={styles.infoContainerStyle}>
              <Image source = {images.tempBg1} style = {[styles.thumbnailStyle]} />
                <View style={[styles.infoStyle]}>
                    <Text 
                      style={[styles.textStyle, styles.headerStyle]}>{header}</Text>
                    <Text 
                      style={[styles.textStyle, styles.subHeaderStyle]}>{subHeader}</Text>
                </View>
            </View>

            <TouchableOpacity onPress={onPress}>
                <Text style={[styles.subHeaderStyle]}>x</Text>
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
    borderColor: colours.lightGray,
    backgroundColor: 'white'
  },
  infoContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  thumbnailStyle: {
    height:50,
    width:50,
    borderRadius: 50,
    marginRight: 15
  },
  textStyle: {
    fontFamily: fonts.normal,
  },
  headerStyle: {
    fontSize: 14,
    color: colours.darkGray
  },
  subHeaderStyle: {
    fontSize: 12,
    color: colours.gray
  },
  infoStyle: {
    flexDirection: 'column',
    flex: 1
  }
});

export { SelectableItem };
