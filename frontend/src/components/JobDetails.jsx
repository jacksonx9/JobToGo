import React, { Component } from 'react';
import {
  Text, View, Image, Modal,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PropTypes from 'prop-types';

import ImageButton from './ImageButton';
import images from '../constants/images';
import { jobDetailsStyles } from '../styles';


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
    const styles = jobDetailsStyles;
    const { modalVisible } = this.state;
    const { job } = this.props;
    return (
      <View style={[styles.containerStyle]}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
        >
          <View style={[styles.modalContainerStyle]}>
            <ImageButton
              source={images.iconChevronDown}
              onPress={() => {
                this.setModalVisible(false);
              }}
            />
            <Text style={[styles.headerStyle]}>{job.company}</Text>
            <View style={[styles.subHeaderContainerStyle]}>
              <Image
                source={images.iconJob}
                styles={[styles.iconStyle]}
              />
              <Text style={[styles.subHeaderStyle]}>{job.title}</Text>
            </View>
            <View style={[styles.subHeaderContainerStyle]}>
              <Image
                source={images.iconLocation}
                styles={[styles.iconStyle]}
              />
              <Text style={[styles.subHeaderStyle]}>{job.location}</Text>
            </View>
            <ScrollView style={[styles.scrollStyle]}>
              <Text>{job.description}</Text>
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
          <Text style={[styles.headerStyle]}>{job.company}</Text>
          <View style={[styles.subHeaderContainerStyle]}>
            <Image
              source={images.iconJob}
              styles={[styles.iconStyle]}
            />
            <Text style={[styles.subHeaderStyle]}>{job.title}</Text>
          </View>
          <View style={[styles.subHeaderContainerStyle]}>
            <Image
              source={images.iconLocation}
              styles={[styles.iconStyle]}
            />
            <Text style={[styles.subHeaderStyle]}>{job.location}</Text>
          </View>
        </View>
      </View>
    );
  }
}

JobDetails.propTypes = {
  job: PropTypes.element.isRequired,
};

export default JobDetails;
