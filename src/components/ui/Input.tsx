import React from 'react';
import { TextInput, TextInputProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { RADIUS } from '@/theme';

interface CustomInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

export const Input: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  style,
  ...props
}) => {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      mode="outlined"
      outlineStyle={styles.outline}
      style={[styles.input, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#ffffff',
  },
  outline: {
    borderRadius: RADIUS.medium,
  },
});

export default Input;
