import { StyleSheet } from 'react-native';

import { colours, fonts, padding, border } from '../../styles';

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    justifyContent: 'center',
    height: 150,
    width: '100%',
    overflow: 'scroll',
    backgroundColor: 'white',
  },
  textContainer: {
    paddingVertical: 7,
    paddingHorizontal: 30,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: 100,
    overflow: 'scroll',
  },
  subHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalContainer: {
    padding: 30,
    fontFamily: fonts.normal,
    color: colours.darkGray,
    height: '100%',
    fontSize: 12,
    backgroundColor: 'white',
  },
  scroll: {
    marginTop: 30,
    height: 500,
    width: '100%',
    overflow: 'scroll',
  },
  header: {
    fontSize: 20,
    color: colours.darkGray,
    fontFamily: fonts.normal,
    paddingBottom: 7,
  },
  subHeader: {
    fontSize: 15,
    color: colours.gray,
    fontFamily: fonts.normal,
    paddingLeft: 6,
  },
  icon: {
    width: 50,
    height: 50,
  },

  
  detailsContainer: {
    height: '92%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: padding.md,
    borderRadius: border.radius,
    backgroundColor: colours.primary,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: '15%',
    width: '100%',
    backgroundColor: 'pink',
  },
  infoContainer: {
    height: '25%',
    width: '100%',
    backgroundColor: 'purple',
    overflow: 'hidden'
  },
  descContainer: {
    height: '60%',
    width: '100%',
    backgroundColor: 'white',
    overflow: 'scroll',
  },
});

export default styles;
