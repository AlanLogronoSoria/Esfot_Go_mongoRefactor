import * as SecureStore from 'expo-secure-store';
import { httpClient } from '@/services/http-client';
import type { Conversation, PrivateMessage } from '../domain/private-message.entity';

const BASE = '/chat';
const AUTH_TOKEN_KEY = 'esfotgo_jwt_token';

async function getToken(): Promise<string | null> {
  try { return SecureStore.getItemAsync(AUTH_TOKEN_KEY); } catch { return null; }
}

export const PrivateChatRepository = {
  async getOrCreateConversation(
    userId: string,
    targetId: string,
  ): Promise<Conversation> {
    const t = await getToken();
    console.log('[PrivateChatRepo] Creando/obteniendo conversacion:', userId, '<->', targetId);
    const { data, error } = await httpClient.post<Conversation>(
      `${BASE}/conversation`,
      { participantIds: [userId, targetId] },
      t,
    );
    if (error || !data) {
      console.log('[PrivateChatRepo] Error en getOrCreateConversation:', error);
      throw new Error(error ?? 'Error al crear conversacion');
    }
    console.log('[PrivateChatRepo] Conversacion obtenida:', data._id);
    return data;
  },

  async getMessages(conversationId: string): Promise<PrivateMessage[]> {
    const t = await getToken();
    const { data, error } = await httpClient.get<PrivateMessage[]>(
      `${BASE}/conversation/${conversationId}/messages`,
      t,
    );
    if (error) {
      console.log('[PrivateChatRepo] Error cargando mensajes:', error);
      return [];
    }
    console.log(`[PrivateChatRepo] ${(data ?? []).length} mensajes cargados para ${conversationId}`);
    return data ?? [];
  },

  async getConversations(): Promise<Conversation[]> {
    const t = await getToken();
    const { data, error } = await httpClient.get<Conversation[]>(
      `${BASE}/conversations`,
      t,
    );
    if (error) {
      console.log('[PrivateChatRepo] Error cargando conversaciones:', error);
      return [];
    }
    return data ?? [];
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    text: string,
  ): Promise<PrivateMessage> {
    const t = await getToken();
    const { data, error } = await httpClient.post<PrivateMessage>(
      `${BASE}/private-message`,
      { conversationId, senderId, senderName, text },
      t,
    );
    if (error || !data) {
      console.log('[PrivateChatRepo] Error enviando mensaje privado:', error);
      throw new Error(error ?? 'Error al enviar mensaje');
    }
    return data;
  },
};
