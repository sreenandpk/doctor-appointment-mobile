import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import ScreenContainer from '../../components/common/ScreenContainer';

export const DoctorDashboardScreen: React.FC = () => {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium">Doctor Dashboard</Text>
        <Text style={styles.subtitle} variant="bodyLarge">
          Manage your availability and appointments here.
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: '#64748b',
    textAlign: 'center',
  },
});
export default DoctorDashboardScreen;
