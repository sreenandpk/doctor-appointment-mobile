import React from 'react';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';

interface CustomButtonProps extends Omit<ButtonProps, 'children'> {
  title: string;
  onPress: () => void;
}

export const Button: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  ...props
}) => {
  return (
    <PaperButton mode="contained" onPress={onPress} {...props}>
      {title}
    </PaperButton>
  );
};
