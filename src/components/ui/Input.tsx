import React from 'react';
import { TextInput, TextInputProps } from 'react-native-paper';

interface CustomInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

export const Input: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  ...props
}) => {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      mode="outlined"
      {...props}
    />
  );
};
export default Input;
