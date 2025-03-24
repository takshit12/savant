export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'content' | 'development' | 'analysis' | 'other';
  webhookUrl?: string;
} 