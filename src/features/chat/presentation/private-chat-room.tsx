import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { usePrivateChat } from '../application/private-chat.hooks';
import { useAuthStore } from '@/store/auth.store';
import type { PrivateMessage } from '../domain/private-message.entity';
import { LightTheme as T, Typography, Sizes, Shadows } from '@/constants/design-system';

interface PrivateChatRoomProps {
  conversationId: string;
  userName: string;
}

export function PrivateChatRoom({ conversationId, userName }: PrivateChatRoomProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { messages, isConnected, sendMessage } = usePrivateChat(conversationId);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList<PrivateMessage>>(null);

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  }, [text, sendMessage]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} strokeWidth={2} color={T.primary} />
        </Pressable>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>{userName}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: isConnected ? T.success : T.textTertiary }]} />
            <Text style={styles.statusText}>
              {isConnected ? 'En linea' : 'Conectando...'}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => {
          const isOwn = item.senderId === user?.id;
          return (
            <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
              {!isOwn && (
                <View style={styles.msgAvatar}>
                  <Text style={styles.msgAvatarText}>
                    {item.senderName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={[styles.msgBubble, isOwn ? styles.msgOwn : styles.msgOther]}>
                <Text style={[styles.msgText, isOwn && styles.msgTextOwn]}>{item.text}</Text>
                <Text style={[styles.msgTime, isOwn && styles.msgTimeOwn]}>
                  {new Date(item.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputBar}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={T.inputPlaceholder}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit
          />
        </View>
        <Pressable
          style={[styles.sendBtn, !text.trim() && styles.sendBtnOff]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Send size={18} strokeWidth={2} color={text.trim() ? '#FFFFFF' : T.textSecondary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Sizes.paddingMd,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 14, gap: 12,
    backgroundColor: T.surfaceGlass,
    borderBottomWidth: 1, borderBottomColor: T.divider,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  headerAvatarText: { fontSize: 16, fontWeight: '800', color: T.primary },
  headerInfo: { flex: 1 },
  headerName: { ...Typography.body, fontWeight: '700', color: T.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...Typography.caption, color: T.textSecondary },
  msgList: { padding: Sizes.paddingMd, flexGrow: 1 },
  msgRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-end', gap: 8 },
  msgRowOwn: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  msgAvatarText: { fontSize: 11, fontWeight: '700', color: T.primary },
  msgBubble: {
    maxWidth: '72%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.cardBorder,
    borderBottomLeftRadius: 4, gap: 2,
  },
  msgOwn: {
    backgroundColor: T.primary, borderColor: T.primary,
    borderBottomLeftRadius: 18, borderBottomRightRadius: 4,
  },
  msgOther: {},
  msgText: { fontSize: 15, color: T.textPrimary, lineHeight: 21 },
  msgTextOwn: { color: '#FFFFFF' },
  msgTime: { fontSize: 10, color: T.textTertiary, alignSelf: 'flex-end' },
  msgTimeOwn: { color: 'rgba(255,255,255,0.55)' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: Sizes.paddingSm,
    backgroundColor: T.surfaceGlass,
    borderTopWidth: 1, borderTopColor: T.divider,
    ...Shadows.sm,
  },
  inputWrap: {
    flex: 1, backgroundColor: T.inputBg, borderRadius: 24,
    borderWidth: 1.5, borderColor: T.inputBorder,
  },
  input: {
    paddingHorizontal: 18, paddingVertical: 11,
    fontSize: 15, color: T.inputText, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center',
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.35,
  },
  sendBtnOff: {
    backgroundColor: T.surface, borderWidth: 1.5, borderColor: T.cardBorder,
  },
});
