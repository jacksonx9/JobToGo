import React, { Component } from 'react';
import {
  Text, View, Image, Modal,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import ImageButton from './ImageButton';
import images from '../constants/images';
import { jobDetailsStyles } from '../styles';


const styles = jobDetailsStyles;
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
            <ScrollView style={[styles.scrollStyle]}>
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
}

export default JobDetails;
