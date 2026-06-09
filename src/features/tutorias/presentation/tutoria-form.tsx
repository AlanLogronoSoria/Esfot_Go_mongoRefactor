import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View, Text, TextInput as RNInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { z } from 'zod';
import type { Tutoria } from '../domain/tutoria.entity';
import { LightTheme as T, Sizes } from '@/constants/design-system';

const tutoriaSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  subject: z.string().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
  description: z.string().max(500).optional().or(z.literal('')),
  date: z.string().min(1, 'Fecha requerida'),
  time: z.string().min(1, 'Hora requerida'),
  duration: z.string().min(1, 'Duración requerida'),
  maxStudents: z.string().min(1, 'Cupo requerido'),
  location: z.string().max(100).optional().or(z.literal('')),
});

type TutoriaFormInput = z.infer<typeof tutoriaSchema>;

type TutoriaSubmitInput = Omit<Tutoria, 'id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>;

interface TutoriaFormProps {
  editData?: Tutoria;
  onSubmit: (data: TutoriaSubmitInput) => Promise<void>;
  isLoading: boolean;
}

export function TutoriaForm({ editData, onSubmit, isLoading }: TutoriaFormProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<TutoriaFormInput>({
    resolver: zodResolver(tutoriaSchema),
    defaultValues: {
      title: editData?.title ?? '',
      subject: editData?.subject ?? '',
      description: editData?.description ?? '',
      date: editData?.date ?? '',
      time: editData?.time ?? '',
      duration: String(editData?.duration ?? 60),
      location: editData?.location ?? '',
      maxStudents: String(editData?.maxStudents ?? 20),
    },
  });

  const doSubmit = async (data: TutoriaFormInput) => {
    await onSubmit({
      title: data.title,
      subject: data.subject,
      description: data.description || undefined,
      date: data.date,
      time: data.time,
      duration: parseInt(data.duration, 10) || 60,
      location: data.location || undefined,
      maxStudents: parseInt(data.maxStudents, 10) || 20,
      status: editData?.status ?? 'programada',
      createdBy: editData?.createdBy ?? '',
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
      <View style={s.root}>
        <Field label="Título *" error={errors.title?.message}>
          <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
            <RNInput style={[s.input, errors.title && s.inputErr]} placeholder="Ej: Cálculo Diferencial" placeholderTextColor={T.inputPlaceholder} onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
        </Field>
        <Field label="Materia *" error={errors.subject?.message}>
          <Controller control={control} name="subject" render={({ field: { onChange, onBlur, value } }) => (
            <RNInput style={[s.input, errors.subject && s.inputErr]} placeholder="Ej: Matemáticas" placeholderTextColor={T.inputPlaceholder} onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
        </Field>
        <Field label="Descripción" error={errors.description?.message}>
          <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
            <RNInput style={[s.input, s.textArea, errors.description && s.inputErr]} placeholder="Describe la tutoría..." placeholderTextColor={T.inputPlaceholder} multiline numberOfLines={3} textAlignVertical="top" onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
        </Field>
        <View style={s.row}>
          <Field label="Fecha *" error={errors.date?.message} half>
            <Controller control={control} name="date" render={({ field: { onChange, onBlur, value } }) => (
              <RNInput style={[s.input, errors.date && s.inputErr]} placeholder="YYYY-MM-DD" placeholderTextColor={T.inputPlaceholder} onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />
          </Field>
          <Field label="Hora *" error={errors.time?.message} half>
            <Controller control={control} name="time" render={({ field: { onChange, onBlur, value } }) => (
              <RNInput style={[s.input, errors.time && s.inputErr]} placeholder="HH:MM" placeholderTextColor={T.inputPlaceholder} onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />
          </Field>
        </View>
        <View style={s.row}>
          <Field label="Duración (min) *" error={errors.duration?.message} half>
            <Controller control={control} name="duration" render={({ field: { onChange, onBlur, value } }) => (
              <RNInput style={[s.input, errors.duration && s.inputErr]} placeholder="60" placeholderTextColor={T.inputPlaceholder} keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={String(value)} />
            )} />
          </Field>
          <Field label="Cupo máx. *" error={errors.maxStudents?.message} half>
            <Controller control={control} name="maxStudents" render={({ field: { onChange, onBlur, value } }) => (
              <RNInput style={[s.input, errors.maxStudents && s.inputErr]} placeholder="20" placeholderTextColor={T.inputPlaceholder} keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={String(value)} />
            )} />
          </Field>
        </View>
        <Field label="Ubicación" error={errors.location?.message}>
          <Controller control={control} name="location" render={({ field: { onChange, onBlur, value } }) => (
            <RNInput style={[s.input, errors.location && s.inputErr]} placeholder="Ej: Aula 101" placeholderTextColor={T.inputPlaceholder} onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
        </Field>
        <TouchableOpacity style={[s.btn, isLoading && s.btnOff]} onPress={handleSubmit(doSubmit)} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={T.text} /> : <Text style={s.btnT}>{editData ? 'Guardar cambios' : 'Crear tutoría'}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Field({ label, error, children, half }: { label: string; error?: string; children: React.ReactNode; half?: boolean }) {
  return <View style={[s.field, half && { flex: 1 }]}>{label && <Text style={s.label}>{label}</Text>}{children}{error && <Text style={s.err}>{error}</Text>}</View>;
}

const s = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  root: { gap: 16, padding: 16 },
  field: { gap: 4 },
  label: { fontSize: 12, fontWeight: '600', color: T.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder, borderRadius: Sizes.radiusMd, padding: 14, fontSize: 15, color: T.inputText },
  textArea: { minHeight: 80 },
  inputErr: { borderColor: T.error },
  err: { color: T.error, fontSize: 12 },
  row: { flexDirection: 'row', gap: 12 },
  btn: { backgroundColor: T.primary, borderRadius: Sizes.radiusMd, padding: 16, alignItems: 'center', marginTop: 8 },
  btnOff: { opacity: 0.5 },
  btnT: { color: T.text, fontSize: 15, fontWeight: '700' },
});
