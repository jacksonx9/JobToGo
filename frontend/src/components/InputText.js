import React from 'react';
import { TextInput } from 'react-native';
import Input, { inputStyles } from './Input';


const InputText = ({ style, title, onChangeText, value }) => {
  const {
    textInputStyle
  } = inputStyles;

  return (
    <Input style={style} title={title}>
      <TextInput
        style={textInputStyle}
        onChangeText={onChangeText}
        value={value}
        clearButtonMode={'always'}
      />
    </Input>
  );
};

export { InputText };
