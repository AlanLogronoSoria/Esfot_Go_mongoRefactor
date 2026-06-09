import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View, Text, TextInput as RNTextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { useState, useCallback } from 'react';
import { eventFormSchema, EVENT_CATEGORY_OPTIONS } from '../domain/event.schema';
import type { EventFormInput, EventFormCategory } from '../domain/event.schema';
import type { Event, EventCategory } from '../domain/event.entity';
import { useCreateEvent, useUpdateEvent } from '../application/event.hooks';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

interface EventFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  editEvent?: Event;
}

function formatDateForInput(isoString: string | null): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTimeForInput(isoString: string | null): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export function EventForm({ onClose, onSuccess, editEvent }: EventFormProps) {
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const isEdit = !!editEvent;

  const { control, handleSubmit, formState: { errors, isDirty }, setValue } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: editEvent?.title ?? '',
      description: editEvent?.description ?? '',
      location: editEvent?.location ?? '',
      category: ((editEvent?.category as string) as EventFormCategory | undefined) ?? 'academico',
      imageUrl: editEvent?.imageUrl ?? '',
      startDate: formatDateForInput(editEvent?.startDate ?? null),
      startTime: formatTimeForInput(editEvent?.startDate ?? null),
      endDate: formatDateForInput(editEvent?.endDate ?? null),
      endTime: formatTimeForInput(editEvent?.endDate ?? null),
      organizer: editEvent?.organizer ?? '',
    },
  });

  const [selectedCategory, setSelectedCategory] = useState<EventFormCategory>(
    (editEvent?.category as EventFormCategory) ?? 'academico'
  );

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = useCallback(async (data: EventFormInput) => {
    try {
      const basePayload = {
        title: data.title,
        description: data.description,
        location: data.location,
        category: data.category as EventCategory,
        imageUrl: data.imageUrl || null,
        startDate: new Date(`${data.startDate}T${data.startTime}:00`).toISOString(),
        endDate: data.endDate && data.endTime
          ? new Date(`${data.endDate}T${data.endTime}:00`).toISOString()
          : null,
        organizer: data.organizer || null,
      };

      if (isEdit && editEvent) {
        await updateMutation.mutateAsync({ id: editEvent.id, input: basePayload });
      } else {
        await createMutation.mutateAsync(basePayload);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Ocurrió un error inesperado');
    }
  }, [isEdit, editEvent, createMutation, updateMutation, onSuccess, onClose]);

  const handleCategorySelect = useCallback((cat: EventFormCategory) => {
    setSelectedCategory(cat);
    setValue('category', cat, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.root}>
        {createMutation.isError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              {(createMutation.error as Error)?.message ?? 'Error al crear el evento'}
            </Text>
          </View>
        )}
        {updateMutation.isError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              {(updateMutation.error as Error)?.message ?? 'Error al actualizar el evento'}
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Título *</Text>
          <Controller control={control} name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput style={[styles.input, errors.title && styles.inputErr]}
                placeholder="Ej: Feria de Tecnología 2026" placeholderTextColor={T.inputPlaceholder}
                onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />
          {errors.title && <Text style={styles.fieldErr}>{errors.title.message}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descripción *</Text>
          <Controller control={control} name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput style={[styles.input, styles.textArea, errors.description && styles.inputErr]}
                placeholder="Describe el evento..." placeholderTextColor={T.inputPlaceholder}
                multiline numberOfLines={4} textAlignVertical="top"
                onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />
          {errors.description && <Text style={styles.fieldErr}>{errors.description.message}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Ubicación *</Text>
          <Controller control={control} name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput style={[styles.input, errors.location && styles.inputErr]}
                placeholder="Ej: Auditorio Principal" placeholderTextColor={T.inputPlaceholder}
                onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />
          {errors.location && <Text style={styles.fieldErr}>{errors.location.message}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.categoryRow}>
            {EVENT_CATEGORY_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.value}
                style={[styles.categoryChip, selectedCategory === opt.value && styles.categoryChipOn]}
                onPress={() => handleCategorySelect(opt.value)} activeOpacity={0.7}>
                <Text style={[styles.categoryChipText, selectedCategory === opt.value && styles.categoryChipTextOn]}>
                  {opt.emoji} {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && <Text style={styles.fieldErr}>{errors.category.message}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Fecha inicio *</Text>
            <Controller control={control} name="startDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput style={[styles.input, errors.startDate && styles.inputErr]}
                  placeholder="YYYY-MM-DD" placeholderTextColor={T.inputPlaceholder}
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.startDate && <Text style={styles.fieldErr}>{errors.startDate.message}</Text>}
          </View>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Hora inicio *</Text>
            <Controller control={control} name="startTime"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput style={[styles.input, errors.startTime && styles.inputErr]}
                  placeholder="HH:MM" placeholderTextColor={T.inputPlaceholder}
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.startTime && <Text style={styles.fieldErr}>{errors.startTime.message}</Text>}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Fecha fin</Text>
            <Controller control={control} name="endDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput style={[styles.input, errors.endDate && styles.inputErr]}
                  placeholder="YYYY-MM-DD" placeholderTextColor={T.inputPlaceholder}
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.endDate && <Text style={styles.fieldErr}>{errors.endDate.message}</Text>}
          </View>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Hora fin</Text>
            <Controller control={control} name="endTime"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput style={[styles.input, errors.endTime && styles.inputErr]}
                  placeholder="HH:MM" placeholderTextColor={T.inputPlaceholder}
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.endTime && <Text style={styles.fieldErr}>{errors.endTime.message}</Text>}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Imagen (URL)</Text>
          <Controller control={control} name="imageUrl"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput style={[styles.input, errors.imageUrl && styles.inputErr]}
                placeholder="https://..." placeholderTextColor={T.inputPlaceholder}
                keyboardType="url" autoCapitalize="none"
                onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />
          {errors.imageUrl && <Text style={styles.fieldErr}>{errors.imageUrl.message}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Organizador</Text>
          <Controller control={control} name="organizer"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput style={[styles.input, errors.organizer && styles.inputErr]}
                placeholder="Ej: Departamento de Sistemas" placeholderTextColor={T.inputPlaceholder}
                onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />
          {errors.organizer && <Text style={styles.fieldErr}>{errors.organizer.message}</Text>}
        </View>

        <TouchableOpacity style={[styles.btn, (!isDirty || isLoading) && styles.btnOff]}
          onPress={handleSubmit(onSubmit)} disabled={!isDirty || isLoading} activeOpacity={0.85}>
          {isLoading ? <ActivityIndicator color={T.text} /> :
            <Text style={styles.btnT}>{isEdit ? 'Guardar cambios' : 'Crear evento'}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  root: { gap: 20, padding: Sizes.paddingMd },
  errorBanner: { backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm, padding: 12, borderLeftWidth: 3, borderLeftColor: T.error },
  errorText: { color: T.error, fontSize: 13 },
  field: { gap: 5 },
  label: { ...Typography.label, color: T.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder, borderRadius: Sizes.radiusMd, padding: 14, fontSize: 15, color: T.inputText },
  textArea: { minHeight: 100 },
  inputErr: { borderColor: T.error },
  fieldErr: { color: T.error, fontSize: 12 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { backgroundColor: T.surface, borderRadius: Sizes.radiusFull, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: T.cardBorder },
  categoryChipOn: { backgroundColor: T.primaryMuted, borderColor: T.primary },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: T.textSecondary },
  categoryChipTextOn: { color: T.primary },
  btn: { backgroundColor: T.primary, borderRadius: Sizes.radiusMd, padding: 16, alignItems: 'center', marginTop: 8, ...Shadows.glow },
  btnOff: { opacity: 0.5 },
  btnT: { ...Typography.button, color: T.text },
});
