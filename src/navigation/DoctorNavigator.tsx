import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';

export type DoctorStackParamList = {
  DoctorDashboard: undefined;
};

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export const DoctorNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="DoctorDashboard"
        component={DoctorDashboardScreen}
        options={{ title: 'Doctor Dashboard' }}
      />
    </Stack.Navigator>
  );
};
export default DoctorNavigator;
