import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar as PaperAvatar } from 'react-native-paper';
import { COLORS } from '@/theme';

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 48,
  color = '#ffffff',
  backgroundColor = COLORS.primary,
}) => {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length > 1) {
      // Handles Dr. John Doe -> JD or John Doe -> JD
      const first = parts[0].toLowerCase().includes('dr') ? parts[1] : parts[0];
      const last = parts[parts.length - 1];
      return ((first ? first[0] : '') + (last ? last[0] : '')).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <View style={styles.container}>
      <PaperAvatar.Text
        size={size}
        label={initials}
        color={color}
        style={{ backgroundColor }}
        labelStyle={styles.label}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
  },
});

export default Avatar;
