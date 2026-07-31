import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Text, Card, Icon } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import { Button, Avatar, SkeletonLoader } from '../../components/ui';
import { patientApi } from '@/api/patient.api';
import { PatientStackParamList } from '@/navigation/PatientNavigator';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/theme';

type DoctorDetailsRouteProp = RouteProp<PatientStackParamList, 'DoctorDetails'>;

interface SlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface DoctorDetailsData {
  id: string;
  fullName: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: string;
  availableSlots: SlotItem[];
}

export const DoctorDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<PatientStackParamList>>();
  const route = useRoute<DoctorDetailsRouteProp>();
  const { doctorId } = route.params;

  const [doctor, setDoctor] = useState<DoctorDetailsData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoctorDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await patientApi.getDoctorDetails(doctorId);
      if (data) {
        setDoctor(data);
        if (data.availableSlots && data.availableSlots.length > 0) {
          const uniqueDates = Array.from(
            new Set(data.availableSlots.map((s: SlotItem) => s.date))
          ).sort() as string[];
          if (uniqueDates.length > 0) {
            setSelectedDate(uniqueDates[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching doctor details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctorDetails();
  }, [fetchDoctorDetails]);

  const getUniqueDates = () => {
    if (!doctor || !doctor.availableSlots) {
      return [];
    }
    const dates = doctor.availableSlots.map((slot) => slot.date);
    return Array.from(new Set(dates)).sort();
  };

  const getSlotsForSelectedDate = () => {
    if (!doctor || !doctor.availableSlots || !selectedDate) {
      return [];
    }
    return doctor.availableSlots.filter((slot) => slot.date === selectedDate);
  };

  const formatHeaderDate = (dateStr: string) => {
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

  // Mock static details for premium layout
  const getMockRating = () => '4.8 ★ (120 reviews)';
  const getMockLocation = (spec: string) => `${spec} Clinic, Care Medical Center`;
  const getMockAbout = (name: string, spec: string) => 
    `Dr. ${name.split(' ').pop()} is a board-certified specialist in ${spec} with over a decade of clinical experience. Passionate about preventative medicine and comprehensive patient-centric care pathways.`;

  if (isLoading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <SkeletonLoader height={140} borderRadius={RADIUS.large} />
          <SkeletonLoader height={80} borderRadius={RADIUS.medium} />
          <SkeletonLoader height={180} borderRadius={RADIUS.large} />
        </View>
      </ScreenContainer>
    );
  }

  if (!doctor) {
    return (
      <ScreenContainer style={styles.errorContainer}>
        <Icon source="alert-circle-outline" size={48} color={COLORS.error} />
        <Text variant="titleMedium">Failed to load doctor profile</Text>
      </ScreenContainer>
    );
  }

  const uniqueDates = getUniqueDates();
  const slotsForDate = getSlotsForSelectedDate();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Doctor Main Header */}
        <View style={styles.header}>
          <Avatar name={doctor.fullName} size={80} type="doctor" backgroundColor="#e0f2fe" color="#0284c7" />
          <View style={styles.headerMeta}>
            <Text style={styles.doctorName} variant="titleLarge">
              {doctor.fullName}
            </Text>
            <Text style={styles.doctorSpec} variant="bodyMedium">
              {doctor.specialization}
            </Text>
            <Text style={styles.doctorQual} variant="bodySmall">
              {doctor.qualification} • {doctor.experienceYears} Years Exp
            </Text>
            <View style={styles.ratingRow}>
              <Icon source="star" size={16} color="#eab308" />
              <Text style={styles.ratingText} variant="bodySmall">
                {getMockRating()}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Block */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Icon source="cash-outline" size={22} color={COLORS.primary} />
              <Text style={styles.statVal} variant="titleMedium">
                ₹{parseFloat(doctor.consultationFee).toFixed(0)}
              </Text>
              <Text style={styles.statLabel} variant="bodySmall">
                Fee
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Icon source="clock-outline" size={22} color="#10b981" />
              <Text style={styles.statVal} variant="titleMedium">
                {doctor.experienceYears}+ Yrs
              </Text>
              <Text style={styles.statLabel} variant="bodySmall">
                Experience
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Professional Profile details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} variant="titleMedium">
            About Doctor
          </Text>
          <Text style={styles.aboutText} variant="bodyMedium">
            {getMockAbout(doctor.fullName, doctor.specialization)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle} variant="titleMedium">
            Location
          </Text>
          <View style={styles.locationContainer}>
            <Icon source="map-marker" size={20} color="#ef4444" />
            <Text style={styles.locationText} variant="bodyMedium">
              {getMockLocation(doctor.specialization)}
            </Text>
          </View>
        </View>

        {/* Date / Availability Calendar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} variant="titleMedium">
            Availability Calendar
          </Text>

          {uniqueDates.length > 0 ? (
            <View>
              <FlatList
                horizontal
                data={uniqueDates}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesList}
                renderItem={({ item }) => {
                  const isSelected = selectedDate === item;
                  const formatted = formatHeaderDate(item);
                  const [weekday, monthDay] = formatted.split(', ');
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedDate(item)}
                      style={[
                        styles.dateChip,
                        isSelected && styles.selectedDateChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateWeekdayText,
                          isSelected && styles.selectedDateText,
                        ]}
                        variant="bodySmall"
                      >
                        {weekday}
                      </Text>
                      <Text
                        style={[
                          styles.dateMonthDayText,
                          isSelected && styles.selectedDateText,
                        ]}
                        variant="bodyLarge"
                      >
                        {monthDay}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyCardContent}>
                <Icon source="calendar-remove" size={32} color="#94a3b8" />
                <Text variant="bodyMedium">No upcoming slots found.</Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Slots for current date display */}
        {selectedDate && slotsForDate.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionSubTitle} variant="titleSmall">
              Available hours for {formatHeaderDate(selectedDate)}
            </Text>
            <View style={styles.slotsGrid}>
              {slotsForDate.map((slot) => (
                <View key={slot.id} style={styles.slotChip}>
                  <Text style={styles.slotText} variant="bodyMedium">
                    {formatTime(slot.startTime)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Booking Bottom Action Bar */}
      <View style={styles.bookingBox}>
        <View style={styles.bookingBoxText}>
          <Text style={styles.bookingTitle} variant="titleMedium">
            Need a Consultation?
          </Text>
          <Text style={styles.bookingSubtitle} variant="bodySmall">
            Choose a date & reserve your time slot
          </Text>
        </View>
        <Button
          title="Book Appointment"
          onPress={() => navigation.navigate('BookAppointment', { doctorId: doctor.id })}
          style={styles.bookButton}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerMeta: {
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  ratingText: {
    color: '#475569',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    ...SHADOWS.light,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: 2,
  },
  statVal: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  statLabel: {
    color: '#64748b',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: SPACING.xs,
  },
  sectionSubTitle: {
    fontWeight: '600',
    color: '#475569',
    marginBottom: SPACING.sm,
  },
  aboutText: {
    color: '#475569',
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    color: '#475569',
    fontWeight: '500',
  },
  datesList: {
    paddingBottom: SPACING.xs,
    gap: 10,
  },
  dateChip: {
    width: 64,
    height: 72,
    borderRadius: RADIUS.medium,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  selectedDateChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateWeekdayText: {
    color: '#64748b',
    fontWeight: '500',
  },
  dateMonthDayText: {
    fontWeight: 'bold',
    color: '#334155',
  },
  selectedDateText: {
    color: '#ffffff',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: SPACING.xs,
  },
  slotChip: {
    width: '31%',
    height: 40,
    borderRadius: RADIUS.medium,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotText: {
    color: '#475569',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: 6,
  },
  bookingBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  bookingBoxText: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  bookingTitle: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  bookingSubtitle: {
    color: '#64748b',
    marginTop: 2,
  },
  bookButton: {
    minWidth: 150,
  },
});

export default DoctorDetailsScreen;
