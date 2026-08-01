import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Text, Card, Portal, Dialog, Icon } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import { Button, Avatar, SkeletonLoader } from '../../components/ui';
import { patientApi } from '@/api/patient.api';
import { PatientStackParamList } from '@/navigation/PatientNavigator';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/theme';

type BookAppointmentRouteProp = RouteProp<PatientStackParamList, 'BookAppointment'>;

interface SlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface DoctorDetails {
  id: string;
  fullName: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: string;
  availableSlots: SlotItem[];
}

export const BookAppointmentScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<PatientStackParamList>>();
  const route = useRoute<BookAppointmentRouteProp>();
  const { doctorId } = route.params;

  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const fetchDoctorDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await patientApi.getDoctorDetails(doctorId);
      if (data) {
        setDoctor(data);
        // Pre-select first date if available
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

  // Extract unique dates from available slots
  const getUniqueDates = () => {
    if (!doctor || !doctor.availableSlots) {
      return [];
    }
    const dates = doctor.availableSlots.map((slot) => slot.date);
    return Array.from(new Set(dates)).sort();
  };

  // Filter slots for the selected date
  const getSlotsForSelectedDate = () => {
    if (!doctor || !doctor.availableSlots || !selectedDate) {
      return [];
    }
    return doctor.availableSlots.filter((slot) => slot.date === selectedDate);
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !doctor) {
      return;
    }
    setIsBooking(true);
    setBookingError(null);
    try {
      await patientApi.bookAppointment({
        doctorId: doctor.id,
        slotId: selectedSlot.id,
      });
      setSuccessVisible(true);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        'Failed to book appointment. Please try again.';
      setBookingError(errorMsg);
    } finally {
      setIsBooking(false);
    }
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

  if (isLoading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <SkeletonLoader height={120} borderRadius={RADIUS.large} style={styles.loadingItem} />
          <SkeletonLoader height={40} borderRadius={RADIUS.medium} style={styles.loadingItem} />
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
        {/* Doctor Info Banner */}
        <Card style={styles.doctorCard}>
          <Card.Content style={styles.doctorCardContent}>
            <Avatar name={doctor.fullName} size={64} backgroundColor="#e0f2fe" color="#0284c7" />
            <View style={styles.doctorMeta}>
              <Text style={styles.doctorName} variant="titleLarge">
                {doctor.fullName}
              </Text>
              <Text style={styles.doctorSpec} variant="bodyMedium">
                {doctor.specialization}
              </Text>
              <Text style={styles.doctorQual} variant="bodySmall">
                {doctor.qualification} • {doctor.experienceYears} Years Exp
              </Text>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel} variant="bodySmall">
                  Consultation Fee:
                </Text>
                <Text style={styles.feeValue} variant="bodyMedium">
                  ₹{parseFloat(doctor.consultationFee).toFixed(0)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Date Selector Section */}
        <Text style={styles.sectionTitle} variant="titleMedium">
          Select Date
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
                    onPress={() => {
                      setSelectedDate(item);
                      setSelectedSlot(null); // Reset slot selection when date changes
                    }}
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
          <Card style={styles.emptySlotsCard}>
            <Card.Content style={styles.emptySlotsContent}>
              <Icon source="calendar-remove" size={32} color="#94a3b8" />
              <Text variant="bodyMedium">No available dates</Text>
            </Card.Content>
          </Card>
        )}

        {/* Time Slot Selector Section */}
        {selectedDate && (
          <View style={styles.timeSection}>
            <Text style={styles.sectionTitle} variant="titleMedium">
              Available Slots
            </Text>

            {slotsForDate.length > 0 ? (
              <View style={styles.slotsGrid}>
                {slotsForDate.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => setSelectedSlot(slot)}
                      style={[
                        styles.slotChip,
                        isSelected && styles.selectedSlotChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          isSelected && styles.selectedSlotText,
                        ]}
                        variant="bodyMedium"
                      >
                        {formatTime(slot.startTime)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Card style={styles.emptySlotsCard}>
                <Card.Content style={styles.emptySlotsContent}>
                  <Icon source="clock-outline" size={32} color="#94a3b8" />
                  <Text variant="bodyMedium">All slots booked for this date</Text>
                </Card.Content>
              </Card>
            )}
          </View>
        )}

        {/* Booking Error feedback */}
        {bookingError && (
          <Text style={styles.errorText} variant="bodyMedium">
            {bookingError}
          </Text>
        )}
      </ScrollView>

      {/* Booking Action Bottom Box */}
      <View style={styles.bookingBox}>
        <View style={styles.bookingBoxDetails}>
          {selectedSlot ? (
            <View>
              <Text style={styles.bookingBoxSlot} variant="titleMedium">
                {formatHeaderDate(selectedSlot.date)}
              </Text>
              <Text style={styles.bookingBoxTime} variant="bodyMedium">
                {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
              </Text>
            </View>
          ) : (
            <Text style={styles.bookingBoxPlaceholder} variant="bodyMedium">
              Please choose a slot
            </Text>
          )}
        </View>
        <Button
          title="Confirm Booking"
          onPress={handleBookAppointment}
          disabled={!selectedSlot || isBooking}
          loading={isBooking}
          style={styles.bookingButton}
        />
      </View>

      {/* Booking Success Dialog */}
      <Portal>
        <Dialog
          visible={successVisible}
          dismissable={false}
          style={styles.dialog}
        >
          <View style={styles.dialogIconContainer}>
            <View style={styles.dialogSuccessCircle}>
              <Icon source="check-bold" size={36} color="#ffffff" />
            </View>
          </View>
          <Dialog.Title style={styles.dialogTitle}>Booking Successful!</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogBody} variant="bodyMedium">
              Your appointment with {doctor.fullName} has been booked. You can view booking details on your dashboard.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              title="Back to Dashboard"
              onPress={() => {
                setSuccessVisible(false);
                navigation.navigate('PatientDashboard');
              }}
              style={styles.dialogButton}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  loadingItem: {
    marginBottom: 4,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 120, // offset for absolute bottom box
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.large,
    marginBottom: SPACING.lg,
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
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  feeLabel: {
    color: '#64748b',
  },
  feeValue: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: SPACING.sm,
  },
  datesList: {
    paddingBottom: SPACING.md,
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
  timeSection: {
    marginTop: SPACING.sm,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    width: '31%',
    height: 40,
    borderRadius: RADIUS.medium,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSlotChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: {
    color: '#475569',
    fontWeight: '500',
  },
  selectedSlotText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptySlotsCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  emptySlotsContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: RADIUS.medium,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: SPACING.md,
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
    // Bottom accent shadow
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  bookingBoxDetails: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  bookingBoxSlot: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  bookingBoxTime: {
    color: '#64748b',
    marginTop: 2,
  },
  bookingBoxPlaceholder: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  bookingButton: {
    minWidth: 150,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.large,
    paddingBottom: SPACING.md,
  },
  dialogIconContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  dialogSuccessCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dialogBody: {
    textAlign: 'center',
    color: '#475569',
  },
  dialogActions: {
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  dialogButton: {
    width: '100%',
  },
});

export default BookAppointmentScreen;
