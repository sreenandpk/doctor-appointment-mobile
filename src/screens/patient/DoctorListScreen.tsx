import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import ScreenContainer from '../../components/common/ScreenContainer';

export const DoctorListScreen: React.FC = () => {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium">Doctor List</Text>
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
  },
});

export default DoctorListScreen;
