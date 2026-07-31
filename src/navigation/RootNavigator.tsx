import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '@/stores/auth.store';
import { ROLES } from '@/constants';
import AuthNavigator from './AuthNavigator';
import DoctorNavigator from './DoctorNavigator';
import PatientNavigator from './PatientNavigator';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, user, isLoading, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isLoading && !isAuthenticated) {
    return <LoadingIndicator />;
  }

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
