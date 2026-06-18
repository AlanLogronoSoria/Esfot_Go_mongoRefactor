import { httpClient } from '@/services/http-client';
import { mapChatMessageDtoToEntity } from '@/services/express/adapters/mongo-mappers';
import type { ChatMessageEntity } from '@/services/express/adapters/mongo-mappers';
import type { ChatMessageDto } from '@/services/express/adapters/mongo-dtos';

export const ChatRepository = {
  async getMessages(room: string = 'general'): Promise<ChatMessageEntity[]> {
    const { data, error } = await httpClient.get<Record<string, unknown>[]>(`/chat/messages?room=${encodeURIComponent(room)}`);
    if (error) {
      console.log('[ChatRepo] Error cargando historial:', error);
      return [];
    }
    const messages = (data ?? []).map((r) => mapChatMessageDtoToEntity(r as ChatMessageDto));
    console.log(`[ChatRepo] ${messages.length} mensajes cargados del historial (room: ${room})`);
    return messages;
  },

  async sendMessage(room: string, from: string, text: string): Promise<void> {
    const { error } = await httpClient.post('/chat/messages', { room, from, text });
    if (error) {
      console.log('[ChatRepo] Error guardando mensaje:', error);
    }
  },
};
