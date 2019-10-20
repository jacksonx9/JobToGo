import React, { Component } from 'react';
import { StyleSheet, Modal, Text, TouchableHighlight, View } from 'react-native';
import { fonts } from '../constants'

class SelectableItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
        };
    }
  
    setModalVisible = (visible) =>{
      this.setState({modalVisible: visible});
    }
  
    render() {
      return (
        <View style={[styles.containerStyle]}>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            >
            <View style={{marginTop: 22}}>
              <View>
                <Text>Hello World!</Text>
  
                <TouchableHighlight
                  onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                  }}>
                  <Text>Hide Modal</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>


            <View style={[styles.infoStyle]}>
                <Text>{this.props.header}</Text>
                <Text>{this.props.subHeader}</Text>
            </View>

  
          <TouchableHighlight
            onPress={() => {
              this.setModalVisible(true);
            }}>
            <Text>Show Modal</Text>
          </TouchableHighlight>
        </View>
      );
    }
  }

const styles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 80,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white'
  },
  textStyle: {
    fontSize: 16,
    fontFamily: fonts.normal
  },
  infoStyle: {
    flexDirection: 'column',
    flex: 1
  }
});

export { SelectableItem };
