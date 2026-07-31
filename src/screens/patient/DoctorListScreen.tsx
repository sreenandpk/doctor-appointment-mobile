import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Icon } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import { SearchBar, Avatar, Button, SkeletonLoader } from '../../components/ui';
import { patientApi } from '@/api/patient.api';
import { PatientStackParamList } from '@/navigation/PatientNavigator';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/theme';

type DoctorListRouteProp = RouteProp<PatientStackParamList, 'DoctorList'>;

interface DoctorItem {
  id: string;
  fullName: string;
  specialization: string;
  experienceYears: number;
  consultationFee: string;
  nextAvailableDate?: string;
  qualification?: string;
}

const SPECIALTY_CHIPS = [
  'All',
  'Pediatrics',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Dermatology',
  'Psychiatry',
];

export const DoctorListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<PatientStackParamList>>();
  const route = useRoute<DoctorListRouteProp>();

  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  // Pre-fill specialty from dashboard nav
  useEffect(() => {
    if (route.params?.specialty) {
      setSelectedSpecialty(route.params.specialty);
    }
  }, [route.params?.specialty]);

  const fetchDoctors = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    if (pageNum === 1 && !shouldRefresh) {
      setIsLoading(true);
    }
    try {
      const params: any = {
        page: pageNum,
        limit: 10,
      };
      if (searchQuery.trim().length > 0) {
        params.name = searchQuery.trim();
      }
      if (selectedSpecialty !== 'All') {
        params.specialization = selectedSpecialty;
      }
      
      const response = await patientApi.searchDoctors(params);
      if (response) {
        const docData = response.data || response;
        if (Array.isArray(docData)) {
          if (pageNum === 1) {
            setDoctors(docData);
          } else {
            setDoctors((prev) => {
              const existingIds = new Set(prev.map((d) => d.id));
              const newItems = docData.filter((d) => !existingIds.has(d.id));
              return [...prev, ...newItems];
            });
          }
        }
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsMoreLoading(false);
    }
  }, [searchQuery, selectedSpecialty]);

  useEffect(() => {
    setPage(1);
    fetchDoctors(1, false);
  }, [searchQuery, selectedSpecialty, fetchDoctors]);

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchDoctors(1, true);
  };

  const loadMore = () => {
    if (isLoading || isMoreLoading || page >= totalPages) {
      return;
    }
    setIsMoreLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDoctors(nextPage, false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Mock static details for rating and location to fit Healthcare SaaS standards
  const getMockRating = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = (4.0 + (sum % 10) / 10).toFixed(1);
    const reviews = 50 + (sum % 200);
    return `${rating} ★ (${reviews} reviews)`;
  };

  const getMockLocation = (specialization: string) => {
    return `${specialization} Dept, Care Medical Center`;
  };

  const renderDoctorItem = ({ item }: { item: DoctorItem }) => {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorDetails', { doctorId: item.id })}>
              <Avatar name={item.fullName} size={52} type="doctor" backgroundColor="#e0f2fe" color="#0284c7" />
            </TouchableOpacity>
            <View style={styles.doctorInfo}>
              <TouchableOpacity onPress={() => navigation.navigate('DoctorDetails', { doctorId: item.id })}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} variant="titleMedium">
                    {item.fullName}
                  </Text>
                  <Text style={styles.rating} variant="bodySmall">
                    {getMockRating(item.id)}
                  </Text>
                </View>
                <Text style={styles.specialty} variant="bodyMedium">
                  {item.specialization} • {item.experienceYears} Years Exp
                </Text>
                <View style={styles.locationRow}>
                  <Icon source="map-marker-outline" size={14} color="#64748b" />
                  <Text style={styles.locationText} variant="bodySmall">
                    {getMockLocation(item.specialization)}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              <View style={styles.footerRow}>
                <View style={styles.feeContainer}>
                  <Text style={styles.feeLabel} variant="bodySmall">
                    Consultation Fee
                  </Text>
                  <Text style={styles.feeValue} variant="titleSmall">
                    ${parseFloat(item.consultationFee).toFixed(0)}
                  </Text>
                </View>
                <Button
                  title="Book Visit"
                  onPress={() => navigation.navigate('BookAppointment', { doctorId: item.id })}
                  style={styles.bookButton}
                  contentStyle={styles.bookButtonContent}
                />
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search doctor by name..."
        />
      </View>

      {/* Specialty Filter Chips */}
      <View>
        <FlatList
          horizontal
          data={SPECIALTY_CHIPS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          renderItem={({ item }) => {
            const isSelected = selectedSpecialty === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedSpecialty(item)}
                style={[
                  styles.chip,
                  isSelected && styles.selectedChip,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.selectedChipText,
                  ]}
                  variant="bodyMedium"
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Doctor Cards List */}
      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={() => (
            <SkeletonLoader height={160} borderRadius={RADIUS.large} style={styles.loaderItem} />
          )}
        />
      ) : doctors.length > 0 ? (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctorItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isMoreLoading ? (
              <View style={styles.moreLoader}>
                <SkeletonLoader height={100} borderRadius={RADIUS.large} />
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon source="account-search-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle} variant="titleMedium">
            No Doctors Found
          </Text>
          <Text style={styles.emptySub} variant="bodyMedium">
            Try adjusting your search query or specialty filters.
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  chipsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: '#475569',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  listContainer: {
    padding: SPACING.md,
    paddingTop: 0,
    paddingBottom: 80,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.large,
    ...SHADOWS.light,
  },
  cardContent: {
    padding: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  name: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  rating: {
    color: '#eab308',
    fontWeight: '600',
  },
  specialty: {
    color: '#64748b',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  locationText: {
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: SPACING.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeContainer: {
    justifyContent: 'center',
  },
  feeLabel: {
    color: '#64748b',
  },
  feeValue: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  bookButton: {
    borderRadius: RADIUS.medium,
  },
  bookButtonContent: {
    height: 38,
  },
  loaderItem: {
    marginBottom: 12,
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
  emptySub: {
    color: '#64748b',
    textAlign: 'center',
  },
  moreLoader: {
    paddingVertical: SPACING.xs,
  },
});

export default DoctorListScreen;
