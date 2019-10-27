import React from 'react'
import { StyleSheet, TouchableOpacity, Image } from 'react-native'


const ImageButton = ({ source, onPress }) => {
  
  const {
    containerStyle
  } = styles

  return (
    <TouchableOpacity
      style={[containerStyle]}
      onPress={onPress}
    >
      <Image
        source={source}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  containerStyle: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export { ImageButton }
