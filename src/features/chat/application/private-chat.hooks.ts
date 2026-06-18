import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { httpClient } from '@/services/http-client';
import { env } from '@/core/config/env';
import { PrivateChatRepository } from '../infrastructure/private-chat.repository';
import { NotificationService } from '@/core/notifications/notification.service';
import type { PrivateMessage, Conversation } from '../domain/private-message.entity';

function getSocketUrl(): string {
  const base = env.EXPO_PUBLIC_API_BASE_URL;
  return base.replace(/\/api\/?$/, '');
}

export function usePrivateChat(conversationId: string | null) {
  const user = useAuthStore((s) => s.user);
  const username = user?.fullName?.trim() || user?.email?.split('@')[0] || 'Usuario';

  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    let cancelled = false;

    PrivateChatRepository.getMessages(conversationId)
      .then((history) => {
        if (!cancelled && history.length > 0) {
          console.log(`[usePrivateChat] Historial cargado vía REST: ${history.length} mensajes`);
          setMessages(history);
        }
      })
      .catch((err) => {
        console.log('[usePrivateChat] Error cargando historial vía REST:', (err as Error)?.message);
      });

    const socket: Socket = io(getSocketUrl(), {
      autoConnect: true,
      transports: ['websocket'],
      forceNew: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', { conversationId, username });
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('private-message', (msg: PrivateMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      if (msg.senderName !== username) {
        NotificationService.sendLocal(
          'Nuevo mensaje',
          `${msg.senderName}: ${msg.text}`,
          { type: 'chat' },
        );
      }
    });

    socket.on('previous-messages', (msgs: PrivateMessage[]) => {
      if (!cancelled) setMessages(msgs);
    });

    return () => {
      cancelled = true;
      socket.emit('leave-room', { conversationId });
      socket.disconnect();
    };
  }, [conversationId, username]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !conversationId || !user) return;

      const timestamp = new Date().toISOString();
      const optimisticMsg: PrivateMessage = {
        _id: `temp-${Date.now()}`,
        conversationId,
        senderId: user.id,
        senderName: username,
        text: text.trim(),
        timestamp,
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      PrivateChatRepository.sendMessage(
        conversationId,
        user.id,
        username,
        text.trim(),
      )
        .then((saved) => {
          setMessages((prev) => {
            if (prev.some((m) => m._id === saved._id)) return prev;
            return prev.map((m) => (m._id === optimisticMsg._id ? saved : m));
          });
        })
        .catch((err) => {
          console.log('[usePrivateChat] Error guardando mensaje vía REST:', (err as Error)?.message);
        });

      if (socketRef.current?.connected) {
        socketRef.current.emit('private-message', {
          conversationId,
          senderId: user.id,
          senderName: username,
          text: text.trim(),
        });
      }
    },
    [conversationId, user, username],
  );

  return { messages, isConnected, sendMessage };
}

interface ChatUser {
  _id: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
}

export function useUserList() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      httpClient.get<any[]>('/estudiantes').then((r) => (r.data ?? []) as any[]),
      httpClient.get<any[]>('/docentes').then((r) => (r.data ?? []) as any[]),
    ]).then(([estRes, docRes]) => {
      const est = (estRes || []).map((u: any) => ({
        _id: u._id ?? '',
        nombre: u.nombre ?? '',
        apellido: u.apellido,
        email: u.email ?? '',
        rol: 'estudiante',
      }));
      const doc = (docRes || []).map((u: any) => ({
        _id: u._id ?? '',
        nombre: u.nombre ?? '',
        apellido: u.apellido,
        email: u.email ?? '',
        rol: 'docente',
      }));
      setUsers([...doc, ...est]);
    }).catch(() => {
      // Silently handle — user list is non-critical
    }).finally(() => setLoading(false));
  }, []);

  const getConversation = useCallback(async (targetId: string) => {
    return PrivateChatRepository.getOrCreateConversation(
      useAuthStore.getState().user?.id ?? '',
      targetId,
    );
  }, []);

  return { users, loading, getConversation };
}
