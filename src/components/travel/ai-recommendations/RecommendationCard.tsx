import React from 'react';
import { Star, Clock, MapPin, ThumbsUp, ThumbsDown, Bookmark, Plus } from 'lucide-react';
import Button from '../../common/Button';

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
 * 推薦カードコンポーネントのプロパティ
 * 
 * @param recommendation - AI推薦データ
 * @param onToggleBookmark - ブックマーク切り替え時のコールバック
 * @param onAddToPlaces - 場所に追加時のコールバック
 * @param onFeedback - フィードバック時のコールバック
 */
interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onToggleBookmark: (id: string) => void;
  onAddToPlaces: (recommendation: AIRecommendation) => void;
  onFeedback: (id: string, isPositive: boolean) => void;
}

/**
 * AI推薦カードコンポーネント
 * 個別のAI推薦を表示し、ブックマーク・追加・フィードバック機能を提供
 */
const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onToggleBookmark,
  onAddToPlaces,
  onFeedback
}) => {
  // 保存済み状態をローカルで管理
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    onAddToPlaces(recommendation);
    setIsSaved(true);
  };

  /**
   * マッチスコアに応じた色を取得
   */
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    if (score >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    if (score >= 70) return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
      {/* マッチ度バッジを削除し、上部のブックマークボタンのみ残す */}
      <div className="relative h-0">
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={() => onToggleBookmark(recommendation.id)}
            className={`p-2 rounded-full transition-colors ${
              recommendation.isBookmarked 
                ? 'bg-yellow-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-yellow-500 hover:text-white'
            }`}
            aria-label={recommendation.isBookmarked ? 'ブックマーク解除' : 'ブックマーク追加'}
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* コンテンツ */}
      <div className="p-4">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{recommendation.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{recommendation.category}</p>
          </div>
        </div>
        
        {/* 説明 */}
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{recommendation.description}</p>
        
        {/* AI理由 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3 dark:bg-purple-900 dark:border-purple-700">
          <p className="text-sm text-purple-800 dark:text-purple-200">{recommendation.aiReason}</p>
        </div>
        
        {/* 詳細情報 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{recommendation.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{recommendation.priceRange}</span>
          </div>
        </div>
        
        {/* タグ */}
        <div className="flex flex-wrap gap-1 mb-4">
          {(recommendation.tags || []).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* アクション */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => onFeedback(recommendation.id, true)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors dark:hover:bg-green-900"
              aria-label="良い推薦"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => onFeedback(recommendation.id, false)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors dark:hover:bg-red-900"
              aria-label="悪い推薦"
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
          {isSaved ? (
            <Button
              variant="secondary"
              size="sm"
              disabled
              className="bg-gray-300 text-white cursor-not-allowed"
            >
              保存済み
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
            >
              <Plus className="h-4 w-4 mr-1" />
              保存
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard; 