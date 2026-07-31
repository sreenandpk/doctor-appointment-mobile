import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import { Avatar, StatusBadge, SkeletonLoader } from '../../components/ui';
import { patientApi } from '@/api/patient.api';
import { PatientStackParamList } from '@/navigation/PatientNavigator';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/theme';

interface AppointmentItem {
  id: string;
  doctorName?: string;
  specialization?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
}

const TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Booked', value: 'BOOKED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const MyAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<PatientStackParamList>>();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  const fetchAppointments = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    if (pageNum === 1 && !shouldRefresh) {
      setIsLoading(true);
    }
    try {
      const params: any = {
        page: pageNum,
        limit: 10,
      };
      if (selectedTab !== 'ALL') {
        params.status = selectedTab;
      }

      const response = await patientApi.getAppointments(params);
      if (response && response.data) {
        if (pageNum === 1) {
          setAppointments(response.data);
        } else {
          setAppointments((prev) => [...prev, ...response.data]);
        }
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsMoreLoading(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    setPage(1);
    fetchAppointments(1, false);
  }, [selectedTab, fetchAppointments]);

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchAppointments(1, true);
  };

  const loadMore = () => {
    if (isMoreLoading || page >= totalPages) {
      return;
    }
    setIsMoreLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAppointments(nextPage, false);
  };

  const formatAppointmentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const renderAppointmentItem = ({ item }: { item: AppointmentItem }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: item.id })}
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.row}>
              <Avatar name={item.doctorName || 'Doctor'} size={44} type="doctor" backgroundColor="#e0f2fe" color="#0284c7" />
              <View style={styles.info}>
                <Text style={styles.doctorName} variant="titleMedium">
                  {item.doctorName}
                </Text>
                <Text style={styles.specialty} variant="bodySmall">
                  {item.specialization}
                </Text>
                <Text style={styles.time} variant="bodySmall">
                  {formatAppointmentDate(item.appointmentDate)} • {item.appointmentTime}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      {/* Tabs Filter Bar */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const isSelected = selectedTab === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setSelectedTab(tab.value)}
              style={[styles.tab, isSelected && styles.selectedTab]}
            >
              <Text style={[styles.tabText, isSelected && styles.selectedTabText]} variant="bodyMedium">
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main List */}
      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.list}
          renderItem={() => (
            <SkeletonLoader height={88} borderRadius={RADIUS.medium} style={styles.loaderItem} />
          )}
        />
      ) : appointments.length > 0 ? (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isMoreLoading ? (
              <View style={styles.moreLoaderContainer}>
                <SkeletonLoader height={72} borderRadius={RADIUS.medium} />
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon source="calendar-blank-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle} variant="titleMedium">
            No Appointments Found
          </Text>
          <Text style={styles.emptySubtitle} variant="bodyMedium">
            You don't have any appointments in this status.
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    justifyContent: 'space-between',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.round,
  },
  selectedTab: {
    backgroundColor: COLORS.primary + '15',
  },
  tabText: {
    color: '#64748b',
    fontWeight: '500',
  },
  selectedTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.md,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    ...SHADOWS.light,
  },
  cardContent: {
    padding: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  doctorName: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  specialty: {
    color: '#64748b',
  },
  time: {
    color: '#475569',
    marginTop: 4,
    fontWeight: '500',
  },
  loaderItem: {
    marginBottom: 4,
  },
  moreLoaderContainer: {
    paddingVertical: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: 8,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    textAlign: 'center',
  },
});

export default MyAppointmentsScreen;
