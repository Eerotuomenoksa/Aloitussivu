
export interface Provider {
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

export interface Shortcut {
  name: string;
  icon: string;
  color: string;
  providers?: Provider[];
  url?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface NewsItem {
  id: number;
  category: string;
  time: string;
  title: string;
  summary: string;
}
