import React from 'react';
import { StyleSheet, Text, View } from 'react-native';


const JobImage = ({ companyName }) => {
    const {
        containerStyle,
        textStyle
    } = styles;

    return (
        <View style={[containerStyle]}>
            <Text style={[textStyle]}>{companyName}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    containerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 400,
        backgroundColor: '#fff',
        paddingHorizontal: 10

    },
    textStyle: {
        fontSize: 50
    }
});

export { JobImage };
