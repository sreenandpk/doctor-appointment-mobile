import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientDashboardScreen from '../screens/patient/PatientDashboardScreen';

export type PatientStackParamList = {
  PatientDashboard: undefined;
};

const Stack = createNativeStackNavigator<PatientStackParamList>();

export const PatientNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="PatientDashboard"
        component={PatientDashboardScreen}
        options={{ title: 'Patient Dashboard' }}
      />
    </Stack.Navigator>
  );
};
export default PatientNavigator;
