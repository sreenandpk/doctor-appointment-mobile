import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { RADIUS } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        mode="outlined"
        left={<TextInput.Icon icon="magnify" color="#64748b" />}
        style={styles.input}
        outlineStyle={styles.outline}
        activeOutlineColor="#0ea5e9"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  input: {
    backgroundColor: '#ffffff',
    height: 48,
  },
  outline: {
    borderRadius: RADIUS.medium,
    borderColor: '#e2e8f0',
  },
});

export default SearchBar;
