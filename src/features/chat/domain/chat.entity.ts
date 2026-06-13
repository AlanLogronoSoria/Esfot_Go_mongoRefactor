export interface ChatMessage {
  text: string;
  from: string;
  timestamp: string;
  isOwn: boolean;
}

export interface ChatUserEvent {
  username: string;
}
