import React from 'react';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { RADIUS } from '@/theme';

interface CustomButtonProps extends Omit<ButtonProps, 'children'> {
  title: string;
  onPress: () => void;
  variant?: 'contained' | 'outlined' | 'text';
}

export const Button: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'contained',
  style,
  ...props
}) => {
  return (
    <PaperButton
      mode={variant}
      onPress={onPress}
      style={[styles.button, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      {...props}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.medium,
    marginVertical: 4,
  },
  content: {
    height: 48,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
