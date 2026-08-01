import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Portal,
  Dialog,
  Icon,
  IconButton,
  FAB,
  TextInput,
} from 'react-native-paper';
import ScreenContainer from '../../components/common/ScreenContainer';
import { Button, StatusBadge, SkeletonLoader } from '../../components/ui';
import { doctorApi } from '@/api/doctor.api';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/theme';

interface SlotItem {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED';
}

export const ManageAvailabilityScreen: React.FC = () => {

  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  // Modal states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  
  // Form states
  const [formDate, setFormDate] = useState('');
  const [formStart, setFormStart] = useState('09:00:00');
  const [formEnd, setFormEnd] = useState('10:00:00');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSlots = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    if (pageNum === 1 && !shouldRefresh) {
      setIsLoading(true);
    }
    try {
      const response = await doctorApi.getSlots({
        page: pageNum,
        limit: 10
      });
      if (response) {
        // If API returns paginated data block
        const slotData = response.data || response;
        if (Array.isArray(slotData)) {
          if (pageNum === 1) {
            setSlots(slotData);
          } else {
            setSlots((prev) => {
              const existingIds = new Set(prev.map((s) => s.id));
              const newItems = slotData.filter((s: any) => !existingIds.has(s.id));
              return [...prev, ...newItems];
            });
          }
        }
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error('Error fetching doctor slots:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsMoreLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(1);
  }, [fetchSlots]);

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchSlots(1, true);
  };

  const loadMore = () => {
    if (isLoading || isMoreLoading || page >= totalPages) {
      return;
    }
    setIsMoreLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSlots(nextPage, false);
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await doctorApi.deleteSlot(id);
      setSlots((prev) => prev.filter((slot) => slot.id !== id));
    } catch (err: any) {
      console.error('Error deleting slot:', err);
      alert(err?.response?.data?.error?.message || 'Failed to delete slot');
    }
  };

  const openCreateDialog = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setFormDate(todayStr);
    setFormStart('09:00:00');
    setFormEnd('10:00:00');
    setFormError(null);
    setIsEditing(false);
    setEditingSlotId(null);
    setDialogVisible(true);
  };

  const openEditDialog = (slot: SlotItem) => {
    setFormDate(slot.date);
    setFormStart(slot.startTime);
    setFormEnd(slot.endTime);
    setFormError(null);
    setIsEditing(true);
    setEditingSlotId(slot.id);
    setDialogVisible(true);
  };

  const handleSaveSlot = async () => {
    setFormError(null);

    // Validate times
    if (!formDate || !formStart || !formEnd) {
      setFormError('All fields are required.');
      return;
    }

    if (formStart >= formEnd) {
      setFormError('Start time must be before end time.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        date: formDate,
        startTime: formStart,
        endTime: formEnd,
      };

      if (isEditing && editingSlotId) {
        await doctorApi.updateSlot(editingSlotId, payload);
      } else {
        await doctorApi.createSlot(payload);
      }

      setDialogVisible(false);
      onRefresh(); // reload list
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to save slot. Check for overlaps.';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const formatSlotDate = (dateStr: string) => {
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

  const renderSlotItem = ({ item }: { item: SlotItem }) => {
    const isBooked = item.status === 'BOOKED';
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.row}>
            <View style={styles.slotDetails}>
              <Text style={styles.slotDate} variant="titleMedium">
                {formatSlotDate(item.date)}
              </Text>
              <Text style={styles.slotTime} variant="bodyMedium">
                {formatTime(item.startTime)} - {formatTime(item.endTime)}
              </Text>
            </View>
            <View style={styles.actions}>
              <StatusBadge status={item.status} />
              {!isBooked && (
                <View style={styles.actionButtons}>
                  <IconButton
                    icon="pencil-outline"
                    iconColor={COLORS.primary}
                    size={20}
                    onPress={() => openEditDialog(item)}
                  />
                  <IconButton
                    icon="trash-can-outline"
                    iconColor={COLORS.error}
                    size={20}
                    onPress={() => handleDeleteSlot(item.id)}
                  />
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScreenContainer>
      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.list}
          renderItem={() => (
            <SkeletonLoader height={80} borderRadius={RADIUS.medium} style={styles.loaderItem} />
          )}
        />
      ) : slots.length > 0 ? (
        <FlatList
          data={slots}
          keyExtractor={(item) => item.id}
          renderItem={renderSlotItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isMoreLoading ? (
              <View style={styles.moreLoader}>
                <SkeletonLoader height={72} borderRadius={RADIUS.medium} />
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon source="calendar-clock" size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle} variant="titleMedium">
            No Availability Slots
          </Text>
          <Text style={styles.emptySubtitle} variant="bodyMedium">
            Tap the + button below to create your first availability slot.
          </Text>
        </View>
      )}

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#ffffff"
        onPress={openCreateDialog}
      />

      {/* Create / Edit Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>
            {isEditing ? 'Edit Availability Slot' : 'Add Availability Slot'}
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              label="Date (YYYY-MM-DD)"
              value={formDate}
              onChangeText={setFormDate}
              mode="outlined"
              placeholder="e.g. 2026-08-01"
              style={styles.input}
              outlineColor="#cbd5e1"
              activeOutlineColor={COLORS.primary}
            />

            <TextInput
              label="Start Time (HH:MM:SS)"
              value={formStart}
              onChangeText={setFormStart}
              mode="outlined"
              placeholder="e.g. 09:00:00"
              style={styles.input}
              outlineColor="#cbd5e1"
              activeOutlineColor={COLORS.primary}
            />

            <TextInput
              label="End Time (HH:MM:SS)"
              value={formEnd}
              onChangeText={setFormEnd}
              mode="outlined"
              placeholder="e.g. 10:00:00"
              style={styles.input}
              outlineColor="#cbd5e1"
              activeOutlineColor={COLORS.primary}
            />

            {formError && (
              <Text style={styles.errorText} variant="bodySmall">
                {formError}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button title="Cancel" variant="text" onPress={() => setDialogVisible(false)} />
            <Button
              title={isSaving ? 'Saving...' : 'Save'}
              onPress={handleSaveSlot}
              disabled={isSaving}
              loading={isSaving}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: SPACING.md,
    paddingBottom: 96, // offset for floating action button
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.medium,
    ...SHADOWS.light,
  },
  cardContent: {
    padding: SPACING.sm,
    paddingLeft: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotDetails: {
    flex: 1,
  },
  slotDate: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  slotTime: {
    color: '#64748b',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.large,
  },
  dialogTitle: {
    fontWeight: 'bold',
  },
  dialogContent: {
    gap: 12,
  },
  input: {
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: COLORS.error,
    fontWeight: '500',
    marginTop: 4,
  },
  loaderItem: {
    marginBottom: 4,
  },
  moreLoader: {
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

export default ManageAvailabilityScreen;
