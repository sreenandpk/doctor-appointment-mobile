import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientDashboardScreen from '../screens/patient/PatientDashboardScreen';
import DoctorListScreen from '../screens/patient/DoctorListScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';

export type PatientStackParamList = {
  PatientDashboard: undefined;
  DoctorList: { specialty?: string } | undefined;
  BookAppointment: { doctorId: string };
};

const Stack = createNativeStackNavigator<PatientStackParamList>();

export const PatientNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="PatientDashboard"
        component={PatientDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorList"
        component={DoctorListScreen}
        options={{ title: 'Find Doctors' }}
      />
      <Stack.Screen
        name="BookAppointment"
        component={BookAppointmentScreen}
        options={{ title: 'Book Appointment' }}
      />
    </Stack.Navigator>
  );
};
export default PatientNavigator;
