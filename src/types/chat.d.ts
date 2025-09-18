export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Message extends ChatMessage {
  id: string;
  ts: number;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
}
