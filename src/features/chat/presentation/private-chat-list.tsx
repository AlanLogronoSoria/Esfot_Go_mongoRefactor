import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Search } from 'lucide-react-native';
import { ChatUserCard } from './chat-user-card';
import { useUserList } from '../application/private-chat.hooks';
import { LightTheme as T, Typography, Sizes, Shadows } from '@/constants/design-system';

interface PrivateChatListProps {
  onSelectUser: (conversationId: string, userName: string) => void;
}

export function PrivateChatList({ onSelectUser }: PrivateChatListProps) {
  const { users, loading, getConversation } = useUserList();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        (u.apellido ?? '').toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const docentes = filtered.filter((u) => u.rol === 'docente');
  const estudiantes = filtered.filter((u) => u.rol !== 'docente');

  const handlePress = async (user: typeof users[0]) => {
    try {
      const conv = await getConversation(user._id);
      onSelectUser(conv._id, `${user.nombre} ${user.apellido ?? ''}`.trim());
    } catch (err) {
      console.log('[PrivateChatList] Error al iniciar conversacion:', (err as Error)?.message);
      Alert.alert('Error', 'No se pudo iniciar la conversación. Verifica tu conexión.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Search size={16} strokeWidth={1.8} color={T.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuario..."
          placeholderTextColor={T.inputPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlashList
        data={[...docentes, ...estudiantes]}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const isFirstDocente = item.rol === 'docente' && docentes[0]?._id === item._id;
          const isFirstEstudiante = item.rol !== 'docente' && estudiantes[0]?._id === item._id;
          return (
            <View>
              {isFirstDocente && docentes.length > 0 && (
                <Text style={styles.sectionTitle}>Docentes</Text>
              )}
              {isFirstEstudiante && estudiantes.length > 0 && (
                <Text style={styles.sectionTitle}>Estudiantes</Text>
              )}
              <ChatUserCard user={item} onPress={() => handlePress(item)} />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.inputBg,
    borderRadius: Sizes.radiusMd,
    paddingHorizontal: 14, height: 44, gap: 8,
    marginHorizontal: Sizes.paddingMd, marginVertical: Sizes.gapSm,
    borderWidth: 1, borderColor: T.inputBorder,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: T.inputText, paddingVertical: 0,
  },
  sectionTitle: {
    ...Typography.overline, color: T.primary,
    paddingHorizontal: Sizes.paddingMd,
    paddingTop: Sizes.gapMd, paddingBottom: 4,
  },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: Sizes.paddingXl,
  },
  emptyText: { ...Typography.body, color: T.textSecondary },
});
