// 型定義やAI関連の型のみ残す
import { Travel } from '../types/Travel';

// スケジュール項目の型
export type ScheduleItem = {
  time: string;
  title: string;
  location: string;
  description: string;
  category: string;
};

// 場所の型
export type Place = {
  id: string;
  name: string;
  category: string;
  rating: number;
  description: string;
  image?: string;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  priceRange?: string;
  isFavorite?: boolean;
};

export interface CreateTravelRequest {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
  schedule?: ScheduleItem[];
  places?: Place[];
  budgetBreakdown?: {
    transportation: number;
    accommodation: number;
    food: number;
    activities: number;
  };
}

export interface GeneratePlanRequest {
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
}

export interface GeneratedPlan {
  schedule: Array<{
    date: string;
    day: string;
    items: Array<{
      time: string;
      title: string;
      location: string;
      description: string;
      category: string;
    }>;
  }>;
  places: Array<{
    name: string;
    category: string;
    rating: number;
    description: string;
  }>;
  budget: {
    transportation: number;
    accommodation: number;
    food: number;
    activities: number;
  };
  recommendations: {
    mustVisit: string[];
    localFood: string[];
    tips: string[];
  };
}

export interface GeneratePlanResponse {
  success: boolean;
  plan: GeneratedPlan;
  message?: string;
  error?: string;
}

export interface AIRecommendation {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  aiReason: string;
  matchScore: number;
  estimatedTime: string;
  priceRange: string;
  tags: string[];
  isBookmarked: boolean;
}

export interface GenerateRecommendationsRequest {
  destination: string;
  region?: string;
  interests: string[];
  budget: string;
  travelStyle: string;
  groupSize: number;
  duration: number;
  customNote?: string;
}

export interface GenerateRecommendationsResponse {
  success: boolean;
  recommendations: AIRecommendation[];
  message?: string;
  error?: string;
}

// travelApi, aiApi, axios, API_BASE_URL などExpress/MongoDB用のAPI呼び出しはすべて削除

// 必要なら型定義だけエクスポート
export type { ScheduleItem, Place, CreateTravelRequest, GeneratePlanRequest, GeneratedPlan, GeneratePlanResponse, AIRecommendation, GenerateRecommendationsRequest, GenerateRecommendationsResponse }; 