import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '@/stores/auth.store';
import { ROLES } from '@/constants';
import AuthNavigator from './AuthNavigator';
import DoctorNavigator from './DoctorNavigator';
import PatientNavigator from './PatientNavigator';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === ROLES.DOCTOR ? (
        <DoctorNavigator />
      ) : (
        <PatientNavigator />
      )}
    </NavigationContainer>
  );
};
export default RootNavigator;
