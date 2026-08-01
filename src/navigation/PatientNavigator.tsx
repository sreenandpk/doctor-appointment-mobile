import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientDashboardScreen from '../screens/patient/PatientDashboardScreen';
import DoctorListScreen from '../screens/patient/DoctorListScreen';
import DoctorDetailsScreen from '../screens/patient/DoctorDetailsScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import MyAppointmentsScreen from '../screens/patient/MyAppointmentsScreen';
import AppointmentDetailsScreen from '../screens/patient/AppointmentDetailsScreen';

export type PatientStackParamList = {
  PatientDashboard: undefined;
  DoctorList: { specialty?: string } | undefined;
  DoctorDetails: { doctorId: string };
  BookAppointment: { doctorId: string };
  MyAppointments: undefined;
  AppointmentDetails: { appointmentId: string };
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
        name="DoctorDetails"
        component={DoctorDetailsScreen}
        options={{ title: 'Doctor Profile' }}
      />
      <Stack.Screen
        name="BookAppointment"
        component={BookAppointmentScreen}
        options={{ title: 'Book Appointment' }}
      />
      <Stack.Screen
        name="MyAppointments"
        component={MyAppointmentsScreen}
        options={{ title: 'My Appointments' }}
      />
      <Stack.Screen
        name="AppointmentDetails"
        component={AppointmentDetailsScreen}
        options={{ title: 'Consultation Details' }}
      />
    </Stack.Navigator>
  );
};
export default PatientNavigator;
