export enum MeatType {
  PORK = 'Thịt Heo',
  BEEF = 'Thịt Bò',
  CHICKEN = 'Thịt Gà',
  UNKNOWN = 'Không xác định'
}

export enum SafetyStatus {
  SAFE = 'Tươi Ngon',
  CAUTION = 'Cần Lưu Ý',
  DANGER = 'Hư Hỏng',
  UNKNOWN = 'Không rõ'
}

export interface AnalysisResult {
  meatType: MeatType;
  freshnessScore: number; // 0 - 100
  freshnessLevel: number; // 1 - 5 (1 is best, 5 is worst)
  safetyStatus: SafetyStatus;
  visualCues: string[];
  summary: string;
  timestamp: number;
}

export interface SensoryData {
  smell: number; // 0 (Thơm) - 100 (Hôi)
  texture: number; // 0 (Đàn hồi) - 100 (Nhão/Nát)
  moisture: number; // 0 (Khô ráo/Ẩm nhẹ) - 100 (Nhớt)
  drip: number; // 0 (Không) - 100 (Nước đục)
}

export type ActionStatus = 'storing' | 'cooked' | 'discarded' | 'expired';
export type StorageEnvironment = 'fridge' | 'freezer' | 'room_temp';
export type ContainerType = 'box' | 'bag' | 'none';

export interface HistoryItem extends AnalysisResult {
  id: string;
  imageUrl: string; // Base64 thumbnail
  storageDeadline: number; // Timestamp when it expires
  actionStatus: ActionStatus; // Current status of the meat
  storageEnvironment?: StorageEnvironment;
  containerType?: ContainerType;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  content: string; // HTML string
  image: string;
  date: string;
  author: string;
  authorRole?: string;
  authorAvatar?: string;
}

export interface DictionaryLevelData {
  label: string;
  color: string; // Tailwind color class for dot
  bgColor: string; // Tailwind bg for card
  colorDescription: string;
  smellDescription: string;
  textureDescription: string;
  storageTip: string;
}

export enum AIPersona {
  CHEF = 'chef',
  HOUSEWIFE = 'housewife',
  FRIEND = 'friend'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  persona: AIPersona;
  title: string; // Usually the first user message or persona name
  messages: ChatMessage[];
  createdAt: number;
  lastMessageAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  level?: number;
  xp?: number;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Thêm interface cho subscription
export interface UserSubscription {
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'yearly';
  expiresAt?: string;
  features?: string[];
}
