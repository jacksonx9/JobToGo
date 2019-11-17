import React, { Component } from 'react';
import {
  Text, View, Image, Modal,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PropTypes from 'prop-types';

import JobImage from '../JobImage';
import ImageButton from '../ImageButton';
import images from '../../constants/images';
import styles from './styles';

class JobDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  setModalVisible = visible => {
    this.setState({ modalVisible: visible });
  }

  render() {
    const { modalVisible } = this.state;
    const {
      logo, company, title, location, description,
    } = this.props;
    return (
      <View style={[styles.container]}>
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
        >
          <View style={styles.detailsContainer}>
            <ImageButton
              source={images.iconChevronDown}
              onPress={() => {
                this.setModalVisible(false);
              }}
            />
            <View style={styles.logoContainer}>
              <JobImage
                logo={logo}
                sideLength={50}
              />
              <Text style={styles.headerDark}>{company}</Text>
            </View>
            <View style={styles.infoContainer}>
              <View style={[styles.subHeaderContainer]}>
                <Image
                  source={images.iconJob}
                  styles={[styles.icon]}
                />
                <Text style={styles.subHeaderDark}>{title}</Text>
              </View>
              <View style={[styles.subHeaderContainer]}>
                <Image
                  source={images.iconLocation}
                  styles={[styles.icon]}
                />
                <Text style={styles.subHeaderDark}>{location}</Text>
              </View>


            </View>
            <ScrollView style={styles.descContainer}>
              <Text style={styles.normalText}>{description}</Text>
            </ScrollView>
          </View>
        </Modal>

        <View style={[styles.textContainer]}>
          <ImageButton
            source={images.iconChevronUp}
            onPress={() => {
              this.setModalVisible(true);
            }}
          />
          <Text style={[styles.header]}>{company}</Text>
          <View style={[styles.subHeaderContainer]}>
            <Image
              source={images.iconJob}
              styles={[styles.icon]}
            />
            <Text style={[styles.subHeader]}>{title}</Text>
          </View>
          <View style={[styles.subHeaderContainer]}>
            <Image
              source={images.iconLocation}
              styles={[styles.icon]}
            />
            <Text style={[styles.subHeader]}>{location}</Text>
          </View>
        </View>
      </View>
    );
  }
}

JobDetails.propTypes = {
  company: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default JobDetails;
