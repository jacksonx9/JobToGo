import React, { Component } from 'react';
import { View, FlatList, Text } from 'react-native';
import axios from 'axios';
import Logger from 'js-logger';

import SelectableItem from '../../components/SelectableItem';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import config from '../../constants/config';
import styles from './styles';
import { colours } from '../../styles';

export default class Search extends Component {
  static navigationOptions = {
    drawerLabel: 'Liked Jobs',
  }

  constructor(props) {
    super(props);
    this.state = {
      likedJobs: [],
      loading: 1,
    };
    this.logger = Logger.get(this.constructor.name);
  }

  render() {
    const { loading, likedJobs } = this.state;
    if (loading) return <Loader />;

    return (
      <View style={styles.container}>
        <SearchBar />
        <View style={styles.listContainer}>
          {this.props.children}
        </View>
      </View>
    );
  }
}
