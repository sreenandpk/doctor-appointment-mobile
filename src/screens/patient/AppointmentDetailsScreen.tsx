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
import { patientApi } from '@/api/patient.api';
import { PatientStackParamList } from '@/navigation/PatientNavigator';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/theme';

type AppointmentDetailsRouteProp = RouteProp<PatientStackParamList, 'AppointmentDetails'>;

interface AppointmentDetailsData {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  appointmentDate: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  doctor?: {
    id: string;
    fullName: string;
    specialization: string;
    qualification: string;
    experienceYears: number;
    consultationFee: string;
  };
  slot?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

export const AppointmentDetailsScreen: React.FC = () => {
  const route = useRoute<AppointmentDetailsRouteProp>();
  const navigation = useNavigation();
  const { appointmentId } = route.params;

  const [appointment, setAppointment] = useState<AppointmentDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointmentDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await patientApi.getAppointmentById(appointmentId);
      if (data) {
        setAppointment(data);
      }
    } catch (err) {
      console.error('Error fetching appointment details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [fetchAppointmentDetails]);

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

  const getMockLocation = (spec: string) => `${spec} Clinic, Care Medical Center`;

  if (isLoading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <SkeletonLoader height={140} borderRadius={RADIUS.large} />
          <SkeletonLoader height={180} borderRadius={RADIUS.large} />
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

  const { doctor, slot } = appointment;

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Doctor Summary Header */}
        {doctor && (
          <Card style={styles.doctorCard}>
            <Card.Content style={styles.doctorCardContent}>
              <Avatar name={doctor.fullName} size={56} type="doctor" backgroundColor="#e0f2fe" color="#0284c7" />
              <View style={styles.doctorMeta}>
                <Text style={styles.doctorName} variant="titleMedium">
                  {doctor.fullName}
                </Text>
                <Text style={styles.doctorSpec} variant="bodySmall">
                  {doctor.specialization}
                </Text>
                <Text style={styles.doctorQual} variant="bodySmall">
                  {doctor.qualification} • {doctor.experienceYears} Yrs Exp
                </Text>
              </View>
              <StatusBadge status={appointment.status} />
            </Card.Content>
          </Card>
        )}

        {/* Schedule & Location Details */}
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

            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Icon source="map-marker" size={20} color="#ef4444" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel} variant="bodySmall">
                  Location
                </Text>
                <Text style={styles.infoValue} variant="bodyMedium">
                  {doctor ? getMockLocation(doctor.specialization) : 'Care Medical Center'}
                </Text>
              </View>
            </View>

            {doctor && (
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Icon source="cash" size={20} color="#eab308" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel} variant="bodySmall">
                    Consultation Fee
                  </Text>
                  <Text style={styles.infoValue} variant="bodyMedium">
                    ${parseFloat(doctor.consultationFee).toFixed(0)} (Paid)
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Prescription/Clinical Notes Section */}
        <Card style={styles.notesCard}>
          <Card.Content>
            <Text style={styles.sectionTitle} variant="titleMedium">
              Patient Notes
            </Text>
            <Text style={styles.notesText} variant="bodyMedium">
              {appointment.notes || 'No notes available for this consultation. Please verify details at the counter on arrival.'}
            </Text>
          </Card.Content>
        </Card>

        {/* Action Button */}
        <Button
          title="Back to Appointments"
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
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    ...SHADOWS.light,
  },
  doctorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  doctorMeta: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  doctorName: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  doctorSpec: {
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  doctorQual: {
    color: '#64748b',
    marginTop: 2,
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

export default AppointmentDetailsScreen;
