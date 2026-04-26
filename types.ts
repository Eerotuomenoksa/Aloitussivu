
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

export interface Favorite {
  name: string;
  url: string;
  categoryName: string;
  categoryIcon: string;
  color: string;
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
