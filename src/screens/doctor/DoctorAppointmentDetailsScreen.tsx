import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { Text, Card, Icon } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/common/ScreenContainer';
import { Avatar, StatusBadge, Button, SkeletonLoader } from '../../components/ui';
import { doctorApi } from '@/api/doctor.api';
import { DoctorStackParamList } from '@/navigation/DoctorNavigator';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/theme';

type DoctorAppointmentDetailsRouteProp = RouteProp<DoctorStackParamList, 'DoctorAppointmentDetails'>;

interface AppointmentDetailsData {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  appointmentDate: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  patient?: {
    id: string;
    fullName: string;
    phone: string;
    gender: 'MALE' | 'FEMALE';
    dateOfBirth: string;
  };
  slot?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

export const DoctorAppointmentDetailsScreen: React.FC = () => {
  const route = useRoute<DoctorAppointmentDetailsRouteProp>();
  const navigation = useNavigation();
  const { appointmentId } = route.params;

  const [appointment, setAppointment] = useState<AppointmentDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointmentDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await doctorApi.getAppointmentById(appointmentId);
      if (data) {
        setAppointment(data);
      }
    } catch (err) {
      console.error('Error fetching doctor appointment details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [fetchAppointmentDetails]);

  const calculateAge = (dobStr: string) => {
    try {
      const dob = new Date(dobStr);
      const diffMs = Date.now() - dob.getTime();
      const ageDate = new Date(diffMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch {
      return 'N/A';
    }
  };

  const formatAppointmentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const [hour, minute] = timeStr.split(':');
      const hourNum = parseInt(hour, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const formattedHour = hourNum % 12 || 12;
      return `${formattedHour}:${minute} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <SkeletonLoader height={120} borderRadius={RADIUS.large} />
          <SkeletonLoader height={200} borderRadius={RADIUS.large} />
        </View>
      </ScreenContainer>
    );
  }

  if (!appointment) {
    return (
      <ScreenContainer style={styles.errorContainer}>
        <Icon source="alert-circle-outline" size={48} color={COLORS.error} />
        <Text variant="titleMedium">Failed to load appointment details</Text>
      </ScreenContainer>
    );
  }

  const { patient, slot } = appointment;

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Patient Profile Details */}
        {patient && (
          <Card style={styles.patientCard}>
            <Card.Content style={styles.patientCardContent}>
              <Avatar name={patient.fullName} size={56} type="patient" backgroundColor="#f1f5f9" color="#475569" />
              <View style={styles.patientMeta}>
                <Text style={styles.patientName} variant="titleMedium">
                  {patient.fullName}
                </Text>
                <Text style={styles.patientSub} variant="bodySmall">
                  {patient.gender} • {calculateAge(patient.dateOfBirth)} Years Old
                </Text>
                <View style={styles.phoneRow}>
                  <Icon source="phone" size={14} color="#64748b" />
                  <Text style={styles.phoneText} variant="bodySmall">
                    {patient.phone}
                  </Text>
                </View>
              </View>
              <StatusBadge status={appointment.status} />
            </Card.Content>
          </Card>
        )}

        {/* Schedule Info */}
        <Card style={styles.detailsCard}>
          <Card.Content style={styles.detailsContent}>
            <Text style={styles.sectionTitle} variant="titleMedium">
              Consultation Schedule
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Icon source="calendar-blank" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel} variant="bodySmall">
                  Date
                </Text>
                <Text style={styles.infoValue} variant="bodyMedium">
                  {formatAppointmentDate(appointment.appointmentDate)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Icon source="clock" size={20} color="#10b981" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel} variant="bodySmall">
                  Time
                </Text>
                <Text style={styles.infoValue} variant="bodyMedium">
                  {slot ? `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}` : 'N/A'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Prescription Notes section */}
        <Card style={styles.notesCard}>
          <Card.Content>
            <Text style={styles.sectionTitle} variant="titleMedium">
              Consultation Notes
            </Text>
            <Text style={styles.notesText} variant="bodyMedium">
              {appointment.notes || 'No clinical notes recorded for this patient visit.'}
            </Text>
          </Card.Content>
        </Card>

        <Button
          title="Back to Dashboard"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    padding: SPACING.md,
    justifyContent: 'center',
  },
  loadingContent: {
    gap: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: 12,
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    ...SHADOWS.light,
  },
  patientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  patientMeta: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  patientName: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  patientSub: {
    color: '#64748b',
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phoneText: {
    color: '#64748b',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    ...SHADOWS.light,
  },
  detailsContent: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: '#64748b',
  },
  infoValue: {
    color: '#334155',
    fontWeight: '500',
    marginTop: 2,
  },
  notesCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    ...SHADOWS.light,
  },
  notesText: {
    color: '#475569',
    lineHeight: 20,
    marginTop: 8,
  },
  backButton: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.medium,
  },
});

export default DoctorAppointmentDetailsScreen;
