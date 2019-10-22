import React, { Component } from 'react';
import { View, FlatList, TouchableOpacity, Text, TextInput, Image, StyleSheet } from 'react-native';
import  { Button, SelectableItem, Loader, NavHeader} from '../components';
import { images, colours, fonts } from '../constants'
import axios from 'axios';

export default class EditFriends extends Component {
  
  static navigationOptions = {
    drawerLabel: 'Friends',
  };
  
  constructor(props) {
      super(props);
      this.state = {
        userId: '',
        userFriends: [],
        addFriendName: '',
        jobIndex: 0,
        loading: 1
      };
    }
    
    async componentDidMount() {
        const userFriends = await axios.get('http://3.16.169.130:8080/jobs/javascript').catch(e => console.log(e));
    
        this.setState({
          userId: this.props.navigation.dangerouslyGetParent().getParam('userId'),
          userFriends: userFriends.data,
          loading: 0
        })

    }

    addFriend = () => {
      console.log(this.state.userId)
      console.log(this.state.addFriendName)
    }

    comfirmFriendRequest = (item, index) => {
      alert(`${item.company}: ${index}`)
    }

    render() {
        if (this.state.loading) return <Loader/>

        return (
            <View style={[styles.containerStyle]}>
                <NavHeader
                  title='Friends'
                  image={images.iconSend}
                  onPressBack={() => this.props.navigation.goBack()}
                  onPressBtn={this.addFriends}
                  enableBtn={false}
                />
                <View style={[styles.searchBarStyle]}>
                  <TextInput
                    style={styles.inputStyle}
                    placeholder={'Add a friend'}
                    value={this.state.addFriendName}
                    placeholderTextColor={colours.Gray}
                    onChangeText={(text) => this.setState({addFriendName: text})}
                  />
                  <Button
                    backgroundColor={'#E6E6E6'}
                    textColor={'#1F1E1F'}
                    title={'Add'}
                    textColor='white'
                    backgroundColor={colours.blue}
                    style={[styles.buttonStyle]}
                    onPress={this.addFriend}
                  />
                </View>
                <FlatList
                    style
                    data={this.state.userFriends}
                    keyExtractor={(item) => item.url}
                    renderItem={({item, index}) =>
                      <SelectableItem
                        key={item.url}
                        header={item.company}
                        subHeader={item.title}
                        onPress={() => this.comfirmFriendRequest(item, index)}
                    />
                    }
                />
            </View>
        );
    };
};


const styles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  searchBarStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 65,
    width: '90%'

  },
  formStyle: {
    paddingTop: 100,
    height: '100%',
    width: '80%',
    position: 'absolute'
  },
  imageStyle: {
    height: 100,
    width: '100%',
    marginBottom: 40
  },
  inputStyle: {
    height: 50,
    width: '70%',
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: colours.darkGray,
    backgroundColor: colours.lighterGray,
    fontFamily: fonts.normal,
  },
  buttonStyle: {
    marginTop: 5,
    marginBottom: 20,
    width: '20%'
  },
  linkStyle: {
    alignItems: 'center'
  },
  textStyle: {
    color: 'white',
    textDecorationColor: 'white'
  }
});
 