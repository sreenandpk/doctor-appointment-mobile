import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS } from '@/theme';

interface StatusBadgeProps {
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: '#d1fae5',
          text: '#065f46',
          label: 'Completed',
        };
      case 'CANCELLED':
        return {
          bg: '#fee2e2',
          text: '#991b1b',
          label: 'Cancelled',
        };
      case 'BOOKED':
      default:
        return {
          bg: '#fef3c7',
          text: '#92400e',
          label: 'Upcoming',
        };
    }
  };

  const config = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]} variant="labelMedium">
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.small,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});

export default StatusBadge;
