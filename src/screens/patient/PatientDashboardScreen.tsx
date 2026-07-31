import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Portal,
  Dialog,
  Icon,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import { Button, Avatar, StatusBadge, SkeletonLoader, SearchBar } from '../../components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { patientApi } from '@/api/patient.api';
import { PatientStackParamList } from '@/navigation/PatientNavigator';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/theme';

interface AppointmentListItem {
  id: string;
  doctorName?: string;
  specialization?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
}

const SPECIALTIES = [
  { name: 'Pediatrics', icon: 'baby-face-outline', color: '#38bdf8' },
  { name: 'Cardiology', icon: 'heart-pulse', color: '#f87171' },
  { name: 'Neurology', icon: 'brain', color: '#a78bfa' },
  { name: 'Orthopedics', icon: 'bone', color: '#fb923c' },
  { name: 'Dermatology', icon: 'hand-water', color: '#f472b6' },
  { name: 'Psychiatry', icon: 'head-snowflake-outline', color: '#4ade80' },
];

export const PatientDashboardScreen: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<PatientStackParamList>>();

  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const fetchAppointments = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const response = await patientApi.getAppointments();
      if (response && response.data) {
        setAppointments(response.data);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
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

  const getPatientName = () => {
    return user?.PatientProfile?.fullName || user?.email?.split('@')[0] || 'Patient';
  };

  const upcomingAppointment = appointments.find(
    (app) => app.status === 'BOOKED'
  );

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

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header Greeting Section */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting} variant="titleLarge">
                Hello, {getPatientName()} 👋
              </Text>
              <Text style={styles.subtitle} variant="bodyMedium">
                Find your doctor and consult online
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Avatar name={getPatientName()} size={40} type="patient" backgroundColor={COLORS.primary} />
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

        {/* Touchable Search Bar banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('DoctorList')}
          style={styles.searchContainer}
          activeOpacity={0.8}
        >
          <View pointerEvents="none">
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder="Search doctor by name or specialty..."
            />
          </View>
        </TouchableOpacity>

        {/* Quick Consultation Find Doctor Banner */}
        <Card style={styles.actionCard}>
          <Card.Content style={styles.actionCardContent}>
            <View style={styles.actionCardTextContainer}>
              <Text style={styles.actionCardTitle} variant="titleLarge">
                Find & Book
              </Text>
              <Text style={styles.actionCardSubtitle} variant="bodyMedium">
                Consult with 1,000+ top-rated medical specialists
              </Text>
              <Button
                title="Book Appointment"
                onPress={() => navigation.navigate('DoctorList')}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
                textColor="#0ea5e9"
              />
            </View>
            <View style={styles.actionCardIconContainer}>
              <Icon source="doctor" size={80} color="#e0f2fe" />
            </View>
          </Card.Content>
        </Card>

        {/* Browse by Specialty Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} variant="titleMedium">
            Browse by Specialty
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialtiesScroll}
        >
          {SPECIALTIES.map((spec) => (
            <TouchableOpacity
              key={spec.name}
              style={styles.specialtyItem}
              onPress={() => navigation.navigate('DoctorList', { specialty: spec.name })}
            >
              <View style={[styles.specialtyIconContainer, { backgroundColor: spec.color + '15' }]}>
                <Icon source={spec.icon} size={30} color={spec.color} />
              </View>
              <Text style={styles.specialtyName} variant="bodySmall">
                {spec.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upcoming Appointment Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} variant="titleMedium">
            Upcoming Appointment
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyAppointments')}>
            <Text style={styles.seeAllText} variant="bodyMedium">
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <SkeletonLoader height={140} borderRadius={RADIUS.large} />
          </View>
        ) : upcomingAppointment ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AppointmentDetails', { appointmentId: upcomingAppointment.id })
            }
          >
            <Card style={styles.upcomingCard}>
              <Card.Content>
                <View style={styles.upcomingHeader}>
                  <View style={styles.doctorInfoRow}>
                    <Avatar name={upcomingAppointment.doctorName || 'Doctor'} size={40} type="doctor" backgroundColor="#e2e8f0" color="#334155" />
                    <View style={styles.doctorMeta}>
                      <Text style={styles.upcomingDoctorName} variant="titleMedium">
                        {upcomingAppointment.doctorName}
                      </Text>
                      <Text style={styles.upcomingDoctorSpecialty} variant="bodySmall">
                        {upcomingAppointment.specialization}
                      </Text>
                    </View>
                  </View>
                  <StatusBadge status={upcomingAppointment.status} />
                </View>

                <View style={styles.divider} />

                <View style={styles.upcomingTimeRow}>
                  <View style={styles.timeInfoItem}>
                    <Icon source="calendar-blank-outline" size={18} color="#64748b" />
                    <Text style={styles.timeText} variant="bodyMedium">
                      {formatAppointmentDate(upcomingAppointment.appointmentDate)}
                    </Text>
                  </View>
                  <View style={styles.timeInfoItem}>
                    <Icon source="clock-outline" size={18} color="#64748b" />
                    <Text style={styles.timeText} variant="bodyMedium">
                      {upcomingAppointment.appointmentTime}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
              <Icon source="calendar-alert" size={40} color="#94a3b8" />
              <Text style={styles.emptyText} variant="bodyMedium">
                No upcoming appointments scheduled.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('DoctorList')}>
                <Text style={styles.emptyActionText} variant="bodyMedium">
                  Find a doctor now
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}

        {/* Recent Appointments Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} variant="titleMedium">
            Recent Visits
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyAppointments')}>
            <Text style={styles.seeAllText} variant="bodyMedium">
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <SkeletonLoader height={72} borderRadius={RADIUS.medium} style={styles.recentLoader} />
            <SkeletonLoader height={72} borderRadius={RADIUS.medium} />
          </View>
        ) : appointments.filter(app => app.status !== 'BOOKED').length > 0 ? (
          appointments
            .filter((app) => app.status !== 'BOOKED')
            .slice(0, 3)
            .map((app) => (
              <TouchableOpacity
                key={app.id}
                onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: app.id })}
              >
                <Card style={styles.recentCard}>
                  <Card.Content style={styles.recentCardContent}>
                    <View style={styles.recentDoctorRow}>
                      <Avatar name={app.doctorName || 'Doctor'} size={36} type="doctor" backgroundColor="#f1f5f9" color="#475569" />
                      <View style={styles.recentDoctorMeta}>
                        <Text style={styles.recentDoctorName} variant="titleSmall">
                          {app.doctorName}
                        </Text>
                        <Text style={styles.recentDoctorSpecialty} variant="bodySmall">
                          {app.specialization} • {formatAppointmentDate(app.appointmentDate)}
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
              No consulting history found.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={logoutVisible} onDismiss={() => setLogoutVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to sign out of CareConnect?</Text>
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
  greetingContainer: {
    flex: 1,
    paddingRight: SPACING.md,
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
  greeting: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    color: '#64748b',
    marginTop: 2,
  },
  actionCard: {
    backgroundColor: '#0ea5e9',
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
    color: '#e0f2fe',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  specialtiesScroll: {
    paddingBottom: SPACING.md,
    gap: 16,
  },
  specialtyItem: {
    alignItems: 'center',
    width: 80,
  },
  specialtyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  specialtyName: {
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center',
  },
  loaderContainer: {
    marginBottom: SPACING.md,
  },
  upcomingCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.large,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  searchContainer: {
    marginBottom: SPACING.md,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorMeta: {
    marginLeft: SPACING.xs,
    flex: 1,
  },
  upcomingDoctorName: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  upcomingDoctorSpecialty: {
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: SPACING.sm,
  },
  upcomingTimeRow: {
    flexDirection: 'row',
    gap: 24,
  },
  timeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    color: '#475569',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.large,
    marginBottom: SPACING.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
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
  emptyActionText: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
  recentDoctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentDoctorMeta: {
    marginLeft: SPACING.xs,
    flex: 1,
  },
  recentDoctorName: {
    fontWeight: 'bold',
    color: '#334155',
  },
  recentDoctorSpecialty: {
    color: '#64748b',
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
  recentLoader: {
    marginBottom: 12,
  },
});

export default PatientDashboardScreen;
