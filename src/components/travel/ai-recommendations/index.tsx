import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import AIPreferences from './AIPreferences';
import RecommendationCard from './RecommendationCard';
import Button from '../../common/Button';
import { Place } from '../../../services/travelApi';

/**
 * AI推薦の型定義
 */
interface AIRecommendation {
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
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
}

/**
 * 旅行設定の型定義
 */
interface TravelPreferences {
  interests: string[];
  budget: string;
  travelStyle: string;
  groupSize: number;
  duration: number;
  customNote?: string;
  region?: string;
}

/**
 * AI推薦タブコンポーネントのプロパティ
 * 
 * @param onAddToPlaces - 場所に追加時のコールバック
 */
interface AIRecommendationsTabProps {
  onAddToPlaces?: (place: any) => void;
  recommendations: any[];
  setRecommendations: (recs: any[]) => void;
}

/**
 * AI推薦タブコンポーネント
 * AIによる旅行推薦の管理、設定変更、フィードバック機能を提供
 */
const AIRecommendationsTab: React.FC<AIRecommendationsTabProps> = ({ onAddToPlaces, recommendations, setRecommendations }) => {
  // 旅行設定の状態
  const [preferences, setPreferences] = useState({
    destination: '',
    region: '',
    interests: ['歴史・文化', '自然・景色', 'グルメ'],
    budget: 'medium',
    travelStyle: 'balanced',
    groupSize: 4,
    duration: 4,
    customNote: ''
  });

  // TravelPreferences <-> GenerateRecommendationsRequest 変換
  const toTravelPreferences = (prefs: any): TravelPreferences => ({
    interests: prefs.interests,
    budget: prefs.budget,
    travelStyle: prefs.travelStyle,
    groupSize: prefs.groupSize,
    duration: prefs.duration,
    customNote: prefs.customNote,
    region: prefs.region
  });
  const toGenerateRecommendationsRequest = (prefs: TravelPreferences): any => ({
    ...preferences,
    ...prefs
  });

  // const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]); // 削除
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * AI推薦を生成
   */
  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      console.log('AI推薦リクエスト送信前 destination:', preferences.destination);
      console.log('AI推薦リクエスト送信内容:', preferences);
      // const res = await aiApi.generateRecommendations(preferences); // aiApiは削除
      // if (res.success) {
        // setRecommendations(res.recommendations.map((rec, idx) => ({ ...rec, id: rec.id || String(idx + 1) })));
      // } else {
        // setRecommendations([]);
        // alert(res.message || res.error || 'AI推薦の生成に失敗しました');
      // }
      // Placeのダミーデータを使用
      const dummyRecommendations: AIRecommendation[] = [
        {
          id: '1',
          name: 'サンフランシスコのショッピング',
          category: 'ショッピング',
          rating: 4.5,
          image: 'https://via.placeholder.com/150',
          description: 'サンフランシスコのビジネス街であるソーラードエリアのショッピングモール。',
          aiReason: 'ショッピングが好きな人におすすめ',
          matchScore: 0.95,
          estimatedTime: '1日',
          priceRange: '高価',
          tags: ['ショッピング', 'ビジネス'],
          isBookmarked: false,
          address: 'サンフランシスコ, カリフォルニア州',
          phone: '415-555-0100',
          website: 'https://www.fishermanswharf.org/',
          openingHours: '10:00-18:00'
        },
        {
          id: '2',
          name: 'サンフランシスコのカフェ',
          category: 'カフェ',
          rating: 4.0,
          image: 'https://via.placeholder.com/150',
          description: 'サンフランシスコのビジネス街であるソーラードエリアのショッピングモール。',
          aiReason: 'カフェが好きな人におすすめ',
          matchScore: 0.85,
          estimatedTime: '1時間',
          priceRange: '中価',
          tags: ['カフェ', 'ビジネス'],
          isBookmarked: false,
          address: 'サンフランシスコ, カリフォルニア州',
          phone: '415-555-0101',
          website: 'https://www.fishermanswharf.org/',
          openingHours: '08:00-17:00'
        },
        {
          id: '3',
          name: 'サンフランシスコのビーチ',
          category: '自然・景色',
          rating: 5.0,
          image: 'https://via.placeholder.com/150',
          description: 'サンフランシスコのビーチです。',
          aiReason: 'ビーチが好きな人におすすめ',
          matchScore: 0.98,
          estimatedTime: '1日',
          priceRange: '無料',
          tags: ['ビーチ', '自然'],
          isBookmarked: false,
          address: 'サンフランシスコ, カリフォルニア州',
          phone: '415-555-0102',
          website: 'https://www.fishermanswharf.org/',
          openingHours: '06:00-18:00'
        }
      ];
      setRecommendations(dummyRecommendations);
    } catch (e) {
      setRecommendations([]);
      console.error('AI推薦APIエラー:', e);
      alert('AI推薦の生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * ブックマークの切り替え
   */
  const toggleBookmark = (id: string) => {
    setRecommendations(recommendations.map(rec => 
      rec.id === id ? { ...rec, isBookmarked: !rec.isBookmarked } : rec
    ));
  };

  /**
   * 場所に追加
   */
  const addToPlaces = (recommendation: AIRecommendation) => {
    const place: Place = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).slice(2),
      name: recommendation.name,
      category: recommendation.category,
      rating: recommendation.rating,
      image: recommendation.image,
      description: recommendation.description,
      address: recommendation.address || '',
      phone: recommendation.phone,
      website: recommendation.website,
      openingHours: recommendation.openingHours || '',
      priceRange: recommendation.priceRange,
      isFavorite: false
    };

    if (onAddToPlaces) {
      onAddToPlaces(place);
    }
    
    // ブックマークに追加
    toggleBookmark(recommendation.id);
  };

  /**
   * フィードバック処理
   */
  const handleFeedback = (id: string, isPositive: boolean) => {
    // フィードバックをAIに送信する処理
    console.log(`Feedback for ${id}: ${isPositive ? 'positive' : 'negative'}`);
  };

  return (
    <div className="space-y-6">
      {/* AI設定 */}
      <AIPreferences
        preferences={toTravelPreferences(preferences)}
        onPreferencesChange={(prefs) => setPreferences(toGenerateRecommendationsRequest(prefs))}
      />

      {/* 推薦生成ボタン */}
      <div className="flex justify-center">
        <Button
          variant="primary"
          onClick={generateRecommendations}
          disabled={isGenerating}
          className="px-8 py-3"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? '推薦を生成中...' : '新しい推薦を生成'}
        </Button>
      </div>

      {/* 推薦一覧 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          AI推薦 ({recommendations.length}件)
        </h3>
        
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onToggleBookmark={toggleBookmark}
                onAddToPlaces={addToPlaces}
                onFeedback={handleFeedback}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">AI推薦がありません</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              設定を調整して「新しい推薦を生成」ボタンを押してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationsTab; 