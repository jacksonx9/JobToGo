import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, Modal, } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { ImageButton } from '../components';
import { images, colours, fonts } from '../constants'


class JobDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  render() {
    return (
      <View style={[styles.containerStyle]}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
        >
          <View style={[styles.modalContainerStyle]}>
            <ImageButton
              source={images.iconChevronDown}
              onPress={() => {
                this.setModalVisible(false);
              }}
            />
            <Text style={[styles.headerStyle]}>{this.props.job.company}</Text>
            <View style={[styles.subHeaderContainerStyle]}>
              <Image
                source={images.iconJob}
                styles={[styles.iconStyle]}
              />
              <Text style={[styles.subHeaderStyle]}>{this.props.job.title}</Text>
            </View>
            <View style={[styles.subHeaderContainerStyle]}>
              <Image
                source={images.iconLocation}
                styles={[styles.iconStyle]}
              />
              <Text style={[styles.subHeaderStyle]}>{this.props.job.location}</Text>
            </View>
            <ScrollView style={[{ marginTop: 30, height: 500, width: '100%', overflow: 'scroll' }]}>
              <Text>{this.props.job.description}</Text>
            </ScrollView>
          </View>
        </Modal>

        <View style={[styles.textContainerStyle]}>
          <ImageButton
            source={images.iconChevronUp}
            onPress={() => {
              this.setModalVisible(true);
            }}
          />
          <Text style={[styles.headerStyle]}>{this.props.job.company}</Text>
          <View style={[styles.subHeaderContainerStyle]}>
            <Image
              source={images.iconJob}
              styles={[styles.iconStyle]}
            />
            <Text style={[styles.subHeaderStyle]}>{this.props.job.title}</Text>
          </View>
          <View style={[styles.subHeaderContainerStyle]}>
            <Image
              source={images.iconLocation}
              styles={[styles.iconStyle]}
            />
            <Text style={[styles.subHeaderStyle]}>{this.props.job.location}</Text>
          </View>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  containerStyle: {
    paddingTop: 15,
    justifyContent: 'center',
    height: 100,
    overflow: 'scroll',
    backgroundColor: 'white',
    zIndex: 10000
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
  modalContainerStyle: {
    padding: 30,
    fontFamily: fonts.normal,
    color: colours.darkGray,
    height: '100%',
    fontSize: 12,
    backgroundColor: 'white',
  },
  headerStyle: {
    fontSize: 20,
    color: colours.darkGray,
    fontFamily: fonts.normal,
    paddingBottom: 7
  },
  subHeaderStyle: {
    fontSize: 15,
    color: colours.gray,
    fontFamily: fonts.normal,
    paddingLeft: 6
  },
  iconStyle: {
    width: 50,
    height: 50,
  }
});

export { JobDetails };
