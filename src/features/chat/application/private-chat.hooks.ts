import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { useExpressAuthStore } from '@/services/express/express-auth.store';
import { env } from '@/core/config/env';
import { PrivateChatRepository } from '../infrastructure/private-chat.repository';
import type { PrivateMessage, Conversation } from '../domain/private-message.entity';

function getSocketUrl(): string {
  const base = env.EXPO_PUBLIC_API_BASE_URL;
  return base.replace(/\/api\/?$/, '');
}

export function usePrivateChat(conversationId: string | null) {
  const user = useAuthStore((s) => s.user);
  const expressToken = useExpressAuthStore((s) => s.expressToken);
  const username = user?.fullName?.trim() || user?.email?.split('@')[0] || 'Usuario';

  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!conversationId) return;

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
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('previous-messages', (msgs: PrivateMessage[]) => {
      setMessages(msgs);
    });

    return () => {
      socket.emit('leave-room', { conversationId });
      socket.disconnect();
    };
  }, [conversationId, username]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !socketRef.current || !conversationId || !user) return;
      socketRef.current.emit('private-message', {
        conversationId,
        senderId: user.id,
        senderName: username,
        text: text.trim(),
      });
    },
    [conversationId, user, username],
  );

  return { messages, isConnected, sendMessage };
}

export function useUserList() {
  const [users, setUsers] = useState<{ _id: string; nombre: string; apellido?: string; email: string; rol: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch from existing user management endpoints
    const token = useExpressAuthStore.getState().expressToken;
    if (!token) return;

    setLoading(true);
    Promise.all([
      fetch(`${env.EXPO_PUBLIC_API_BASE_URL}/admin/estudiantes`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()).catch(() => ({ data: [] })),
      fetch(`${env.EXPO_PUBLIC_API_BASE_URL}/admin/docentes`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([estRes, docRes]) => {
      const est = (estRes.data || estRes || []) as any[];
      const doc = (docRes.data || docRes || []) as any[];
      setUsers([...doc, ...est]);
    }).finally(() => setLoading(false));
  }, []);

  const getConversation = useCallback(async (targetId: string) => {
    const token = useExpressAuthStore.getState().expressToken;
    if (!token) throw new Error('No autenticado');
    return PrivateChatRepository.getOrCreateConversation(
      useAuthStore.getState().user?.id ?? '',
      targetId,
      token,
    );
  }, []);

  return { users, loading, getConversation };
}
