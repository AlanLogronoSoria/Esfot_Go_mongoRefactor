export interface PrivateMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  _id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessage?: string;
  lastMessageAt?: string;
}
