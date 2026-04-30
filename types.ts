export interface Provider {
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

export interface Municipality {
  code: string;
  name: string;
  wellbeingAreaCode?: string;
  wellbeingAreaName?: string;
}

export interface RegionalContext {
  municipality: Municipality;
  displayName: string;
}

export interface LocalityInfo {
  municipality: string;
  displayName: string;
}

export interface RssFeedConfig {
  name: string;
  url: string;
}

export interface LocalNewsHeadline {
  title: string;
  link: string;
  source: string;
  publishedAt?: string;
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
