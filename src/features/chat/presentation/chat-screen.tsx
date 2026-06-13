import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useChat } from '../application/chat.hooks';
import type { ChatMessage } from '../domain/chat.entity';
import { useAuthStore } from '@/store/auth.store';
import { LightTheme as T, Typography, Sizes } from '@/constants/design-system';
import { Send, Wifi, WifiOff } from 'lucide-react-native';

export function ChatScreen() {
  const user = useAuthStore((s) => s.user);
  const username = user?.fullName?.trim() || user?.email?.split('@')[0] || 'Usuario';

  const { messages, isConnected, usersOnline, sendMessage, notification, clearNotification } = useChat();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const notifOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notification) {
      Animated.sequence([
        Animated.timing(notifOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(3000),
        Animated.timing(notifOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => clearNotification());
    }
  }, [notification, notifOpacity, clearNotification]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  }, [inputText, sendMessage]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
    <View style={[styles.msgRow, item.isOwn && styles.msgRowOwn]}>
      <View style={[styles.msgBubble, item.isOwn ? styles.msgBubbleOwn : styles.msgBubbleOther]}>
        {!item.isOwn && (
          <Text style={styles.msgFrom}>{item.from}</Text>
        )}
        <Text style={[styles.msgText, item.isOwn && styles.msgTextOwn]}>
          {item.text}
        </Text>
        <Text style={[styles.msgTime, item.isOwn && styles.msgTimeOwn]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  ), []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Chat ESFOT</Text>
            <View style={styles.statusRow}>
              {isConnected ? (
                <Wifi size={12} color={T.success} />
              ) : (
                <WifiOff size={12} color={T.error} />
              )}
              <Text style={styles.statusText}>
                {isConnected ? `${usersOnline} en línea` : 'Conectando...'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {notification && (
        <Animated.View style={[styles.notifBanner, { opacity: notifOpacity }]}>
          <Text style={styles.notifText}>{notification}</Text>
        </Animated.View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderMessage}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No hay mensajes aún</Text>
            <Text style={styles.emptySub}>¡Sé el primero en escribir!</Text>
          </View>
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={T.inputPlaceholder}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnOff]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.7}
        >
          <Send size={18} color={inputText.trim() ? T.text : T.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.background },
  header: {
    paddingHorizontal: Sizes.paddingMd,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 12,
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.divider,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: T.primaryMuted, justifyContent: 'center', alignItems: 'center',
  },
  headerAvatarText: { fontSize: 18, fontWeight: '800', color: T.primary },
  headerTitle: { ...Typography.h4, color: T.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusText: { fontSize: 12, color: T.textSecondary },
  notifBanner: {
    backgroundColor: T.infoBg, paddingVertical: 8, paddingHorizontal: Sizes.paddingMd,
    borderBottomWidth: 1, borderBottomColor: T.cardBorder,
  },
  notifText: { fontSize: 12, color: T.info, textAlign: 'center' },
  msgList: { padding: Sizes.paddingMd, gap: 10, flexGrow: 1 },
  msgRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  msgRowOwn: { justifyContent: 'flex-end' },
  msgBubble: {
    maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.cardBorder,
    borderBottomLeftRadius: 4,
  },
  msgBubbleOwn: {
    backgroundColor: T.primary, borderColor: T.primary,
    borderBottomLeftRadius: 18, borderBottomRightRadius: 4,
  },
  msgBubbleOther: {},
  msgFrom: { fontSize: 11, fontWeight: '700', color: T.textSecondary, marginBottom: 2 },
  msgText: { fontSize: 14, color: T.textPrimary, lineHeight: 20 },
  msgTextOwn: { color: T.text },
  msgTime: { fontSize: 10, color: T.textSecondary, textAlign: 'right', marginTop: 4 },
  msgTimeOwn: { color: T.primaryMuted },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...Typography.h4, color: T.textSecondary },
  emptySub: { fontSize: 13, color: T.textSecondary, marginTop: 4 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: Sizes.paddingSm, backgroundColor: T.surface,
    borderTopWidth: 1, borderTopColor: T.divider,
  },
  input: {
    flex: 1, backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: T.inputText, maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnOff: { backgroundColor: T.surface, borderWidth: 1, borderColor: T.cardBorder },
});
