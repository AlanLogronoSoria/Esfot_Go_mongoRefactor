import { httpClient } from '@/services/http-client';
import type { Conversation, PrivateMessage } from '../domain/private-message.entity';

const BASE = '/chat';

export const PrivateChatRepository = {
  async getOrCreateConversation(
    userId: string,
    targetId: string,
    token: string,
  ): Promise<Conversation> {
    const { data, error } = await httpClient.post<Conversation>(
      `${BASE}/conversation`,
      { participantIds: [userId, targetId] },
      token,
    );
    if (error || !data) throw new Error(error ?? 'Error al crear conversación');
    return data;
  },

  async getMessages(
    conversationId: string,
    token: string,
  ): Promise<PrivateMessage[]> {
    const { data, error } = await httpClient.get<PrivateMessage[]>(
      `${BASE}/conversation/${conversationId}/messages`,
      token,
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getConversations(token: string): Promise<Conversation[]> {
    const { data, error } = await httpClient.get<Conversation[]>(
      `${BASE}/conversations`,
      token,
    );
    if (error) throw new Error(error);
    return data ?? [];
  },
};
