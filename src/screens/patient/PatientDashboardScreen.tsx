import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import ScreenContainer from '../../components/common/ScreenContainer';

export const PatientDashboardScreen: React.FC = () => {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium">Patient Dashboard</Text>
        <Text style={styles.subtitle} variant="bodyLarge">
          Search doctors and schedule appointments here.
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
export default PatientDashboardScreen;
