import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Portal, Dialog, Icon, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import { Button, Avatar, StatusBadge, SkeletonLoader } from '../../components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { doctorApi } from '@/api/doctor.api';
import { DoctorStackParamList } from '@/navigation/DoctorNavigator';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/theme';

interface DoctorAppointmentItem {
  id: string;
  patientName?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
}

export const DoctorDashboardScreen: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<DoctorStackParamList>>();

  const [appointments, setAppointments] = useState<DoctorAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const fetchAppointments = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const response = await doctorApi.getAppointments();
      if (response && response.data) {
        setAppointments(response.data);
      }
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAppointments(true);
  };

  const getDoctorName = () => {
    return user?.DoctorProfile?.fullName || user?.email?.split('@')[0] || 'Doctor';
  };

  const formatAppointmentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getTodayBookings = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return appointments.filter(
      (app) => app.appointmentDate === todayStr && app.status === 'BOOKED'
    );
  };

  const todayBookings = getTodayBookings();
  const upcomingBookings = appointments.filter((app) => app.status === 'BOOKED');

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Top Greeting Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting} variant="titleLarge">
                {getDoctorName().startsWith('Dr.') ? getDoctorName() : `Dr. ${getDoctorName()}`} 🏥
              </Text>
              <Text style={styles.subtitle} variant="bodyMedium">
                {user?.DoctorProfile?.specialization || 'Healthcare Professional'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Avatar name={getDoctorName()} size={40} type="doctor" backgroundColor={COLORS.primary} />
              <IconButton
                icon="logout"
                iconColor="#64748b"
                size={22}
                onPress={() => setLogoutVisible(true)}
                style={styles.logoutButton}
              />
            </View>
          </View>
        </View>

        {/* Quick Manage Availability Banner */}
        <Card style={styles.actionCard}>
          <Card.Content style={styles.actionCardContent}>
            <View style={styles.actionCardTextContainer}>
              <Text style={styles.actionCardTitle} variant="titleLarge">
                Manage Schedule
              </Text>
              <Text style={styles.actionCardSubtitle} variant="bodyMedium">
                Configure your consultation hours and availability slots
              </Text>
              <Button
                title="Configure Availability"
                onPress={() => navigation.navigate('ManageAvailability')}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
                textColor="#10b981"
              />
            </View>
            <View style={styles.actionCardIconContainer}>
              <Icon source="calendar-clock" size={72} color="#ecfdf5" />
            </View>
          </Card.Content>
        </Card>

        {/* Stats Row Section */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Text style={styles.statValue} variant="headlineMedium">
                {todayBookings.length}
              </Text>
              <Text style={styles.statLabel} variant="bodySmall">
                Today's Visits
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Text style={styles.statValueSuccess} variant="headlineMedium">
                {upcomingBookings.length}
              </Text>
              <Text style={styles.statLabel} variant="bodySmall">
                Total Booked
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Schedule Listing Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} variant="titleMedium">
            Upcoming Appointments
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <SkeletonLoader height={72} borderRadius={RADIUS.medium} style={styles.loaderItem} />
            <SkeletonLoader height={72} borderRadius={RADIUS.medium} />
          </View>
        ) : upcomingBookings.length > 0 ? (
          upcomingBookings.map((app) => (
            <TouchableOpacity
              key={app.id}
              onPress={() =>
                navigation.navigate('DoctorAppointmentDetails', { appointmentId: app.id })
              }
            >
              <Card style={styles.appCard}>
                <Card.Content style={styles.appCardContent}>
                  <View style={styles.patientRow}>
                    <Avatar name={app.patientName || 'Patient'} size={40} type="patient" backgroundColor="#f1f5f9" color="#475569" />
                    <View style={styles.patientMeta}>
                      <Text style={styles.patientName} variant="titleSmall">
                        {app.patientName}
                      </Text>
                      <Text style={styles.timeText} variant="bodySmall">
                        {formatAppointmentDate(app.appointmentDate)} • {app.appointmentTime}
                      </Text>
                    </View>
                  </View>
                  <StatusBadge status={app.status} />
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
              <Icon source="calendar-check-outline" size={40} color="#94a3b8" />
              <Text style={styles.emptyText} variant="bodyMedium">
                No upcoming consultations scheduled.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Completed History Section */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
          <Text style={styles.sectionTitle} variant="titleMedium">
            Completed Consultations
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <SkeletonLoader height={72} borderRadius={RADIUS.medium} />
          </View>
        ) : appointments.filter(app => app.status !== 'BOOKED').length > 0 ? (
          appointments
            .filter((app) => app.status !== 'BOOKED')
            .slice(0, 3)
            .map((app) => (
              <TouchableOpacity
                key={app.id}
                onPress={() =>
                  navigation.navigate('DoctorAppointmentDetails', { appointmentId: app.id })
                }
              >
                <Card key={app.id} style={styles.recentCard}>
                  <Card.Content style={styles.recentCardContent}>
                    <View style={styles.patientRow}>
                      <Avatar name={app.patientName || 'Patient'} size={36} type="patient" backgroundColor="#f8fafc" color="#64748b" />
                      <View style={styles.patientMeta}>
                        <Text style={styles.recentPatientName} variant="titleSmall">
                          {app.patientName}
                        </Text>
                        <Text style={styles.timeText} variant="bodySmall">
                          {formatAppointmentDate(app.appointmentDate)} • {app.appointmentTime}
                        </Text>
                      </View>
                    </View>
                    <StatusBadge status={app.status} />
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))
        ) : (
          <View style={styles.noHistoryContainer}>
            <Text style={styles.noHistoryText} variant="bodyMedium">
              No recent history found.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={logoutVisible} onDismiss={() => setLogoutVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to sign out of Doctor Booking?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              title="Cancel"
              variant="text"
              onPress={() => setLogoutVisible(false)}
            />
            <Button
              title="Sign Out"
              variant="text"
              onPress={() => {
                setLogoutVisible(false);
                logout();
              }}
              loading={isAuthLoading}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  header: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoutButton: {
    margin: 0,
    marginRight: -8,
  },
  actionCard: {
    backgroundColor: '#10b981',
    borderRadius: RADIUS.large,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  actionCardTextContainer: {
    flex: 2,
  },
  actionCardTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  actionCardSubtitle: {
    color: '#ecfdf5',
    marginVertical: SPACING.xs,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  actionButtonContent: {
    height: 38,
  },
  actionCardIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.15,
  },
  greetingContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  greeting: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.large,
    ...SHADOWS.light,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statValueSuccess: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  loaderContainer: {
    marginBottom: SPACING.md,
    gap: 12,
  },
  loaderItem: {
    marginBottom: 4,
  },
  appCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    marginBottom: 10,
    ...SHADOWS.light,
  },
  appCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientMeta: {
    marginLeft: SPACING.xs,
    flex: 1,
  },
  patientName: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  timeText: {
    color: '#64748b',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.large,
    marginBottom: SPACING.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: 8,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
  },
  recentCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    marginBottom: SPACING.xs,
    ...SHADOWS.light,
  },
  recentCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentPatientName: {
    fontWeight: 'bold',
    color: '#334155',
  },
  noHistoryContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  noHistoryText: {
    color: '#94a3b8',
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.large,
  },
  dialogTitle: {
    fontWeight: 'bold',
  },
  loaderItemStyle: {
    marginBottom: 12,
  },
});

export default DoctorDashboardScreen;
