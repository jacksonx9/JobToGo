import React, { Component } from 'react';
import {
  Text, View, Image, Modal,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Feather';

import JobImage from '../JobImage';
import ImageButton from '../ImageButton';
import IconButton from '../IconButton';
import images from '../../constants/images';
import styles from './styles';
import { colours, sizes } from '../../styles';

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
            <IconButton
              name="chevron-down"
              color={colours.white}
              size={sizes.iconLg}
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
                <Icon
                  name="briefcase"
                  color={colours.white}
                  size={17}
                />
                <Text style={styles.subHeaderDark}>{title}</Text>
              </View>
              <View style={[styles.subHeaderContainer]}>
                <Icon
                  name="map-pin"
                  color={colours.white}
                  size={17}
                />
                <Text style={styles.subHeaderDark}>{location}</Text>
              </View>
            </View>
            <ScrollView style={styles.descContainer}>
              <Text style={styles.normalText}>{description}</Text>
            </ScrollView>
          </View>
        </Modal>

        <View style={styles.textContainer}>
          <Text style={styles.header}>{company}</Text>
          <View style={styles.subHeaderContainer}>
            <Icon
              name="briefcase"
              color={colours.lightGray}
              size={17}
            />
            <Text style={styles.subHeader}>{title}</Text>
          </View>
          <View style={styles.subHeaderContainer}>
            <Icon
              name="map-pin"
              color={colours.lightGray}
              size={17}
            />
            <Text style={styles.subHeader}>{location}</Text>
          </View>
        </View>
        <View style={styles.expandBtnContainer}>
          <IconButton
            name="info"
            color={colours.lightGray}
            size={sizes.icon}
            onPress={() => {
              this.setModalVisible(true);
            }}
          />
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
