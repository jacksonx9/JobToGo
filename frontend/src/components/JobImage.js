import React from 'react';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import { images, colours } from '../constants'

const JobImage = ({ companyName }) => {
    const {
        containerStyle,
        textStyle,
    } = styles;

    return (
            <ImageBackground source={images.tempBg1} style={[containerStyle]}>
                <Text style={[textStyle]}>{companyName}</Text>
            </ImageBackground>

    );
};

const styles = StyleSheet.create({
    containerStyle: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        height: 450,
    },
    textStyle: {
        textAlign: 'center',
        fontSize: 50,
        color: 'white',
    }
});

export { JobImage };
