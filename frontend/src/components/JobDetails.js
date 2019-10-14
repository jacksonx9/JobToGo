import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { ImageButton } from '../components';
import { images, colours, fonts } from '../constants'

const JobDetails = ({ company, job, location }) => {
    const {
        containerStyle,
        textContainerStyle,
        subHeaderContainerStyle,
        headerStyle,
        subHeaderStyle,
        iconStyle,
    } = styles;

    return (
        <View style={[containerStyle]}>
            <ImageButton
                source={images.iconChevronUp}
                onPress={() => console.log('hi')}
            />
            <View style={[textContainerStyle]}>
                <Text style={[headerStyle]}>{company}</Text>
                <View style={[subHeaderContainerStyle]}>
                    <Image
                        source={images.iconJob}
                        styles={[iconStyle]}
                    />
                    <Text style={[subHeaderStyle]}>{job}</Text>
                </View>
                <View style={[subHeaderContainerStyle]}>
                    <Image
                        source={images.iconLocation}
                        styles={[iconStyle]}
                    />
                    <Text style={[subHeaderStyle]}>{location}</Text>
                </View>
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    containerStyle: {
        paddingTop: 50,
        justifyContent: 'center',
        height: 100,
        overflow: 'scroll'
    },
    textContainerStyle: {
        paddingVertical: 7,
        paddingHorizontal: 30,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        height: 100,
        overflow: 'scroll'
    },
    subHeaderContainerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    headerStyle: {
        fontSize: 20,
        color: colours.darkGray,
        fontFamily: fonts.normal,
        paddingBottom: 7
    },
    subHeaderStyle: {
        fontSize: 15,
        color: colours.lightGray,
        fontFamily: fonts.normal,
        paddingLeft: 6
    },
    iconStyle: {
        width: 50,
        height: 50,
    }
});

export { JobDetails };
