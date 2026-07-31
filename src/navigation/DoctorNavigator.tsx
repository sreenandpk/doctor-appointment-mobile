import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';
import ManageAvailabilityScreen from '../screens/doctor/ManageAvailabilityScreen';
import DoctorAppointmentDetailsScreen from '../screens/doctor/DoctorAppointmentDetailsScreen';

export type DoctorStackParamList = {
  DoctorDashboard: undefined;
  ManageAvailability: undefined;
  DoctorAppointmentDetails: { appointmentId: string };
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
      <Stack.Screen
        name="ManageAvailability"
        component={ManageAvailabilityScreen}
        options={{ title: 'Manage Availability' }}
      />
      <Stack.Screen
        name="DoctorAppointmentDetails"
        component={DoctorAppointmentDetailsScreen}
        options={{ title: 'Appointment Details' }}
      />
    </Stack.Navigator>
  );
};
export default DoctorNavigator;
