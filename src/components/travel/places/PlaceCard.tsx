import React from 'react';
import { MapPin, Star, Clock, Phone, Globe, Heart, Edit3, Trash2 } from 'lucide-react';
import PlaceDetailModal from './PlaceDetailModal';

/**
 * 観光スポットの型定義
 */
interface Place {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  rating: number;
  image: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  openingHours: string;
  priceRange: string;
  isFavorite: boolean;
}

/**
 * 観光スポットカードコンポーネントのプロパティ
 * 
 * @param place - 観光スポットデータ
 * @param onToggleFavorite - お気に入り切り替え時のコールバック
 * @param onEdit - 編集ボタンクリック時のコールバック
 * @param onDelete - 削除ボタンクリック時のコールバック
 */
interface PlaceCardProps {
  place: Place;
  onToggleFavorite: (id: string) => void;
  onEdit: (place: Place) => void;
  onDelete: (placeId: string) => void;
}

/**
 * 観光スポットカードコンポーネント
 * 観光スポットの詳細情報を表示し、お気に入り・編集・削除機能を提供
 */
const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onToggleFavorite,
  onEdit,
  onDelete
}) => {
  const [showDetail, setShowDetail] = React.useState(false);
  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        {/* 画像部分は完全に削除 */}
        <div className="p-4 flex flex-col h-full">
          {/* タイトルと評価 */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
            <div className="flex items-center gap-1">
              {/* 編集・削除アイコンを右上にコンパクト配置 */}
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(place); }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="編集"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(place.id); }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                aria-label="削除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {/* お気に入りボタン */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(place.id); }}
                className={`p-2 rounded-full transition-colors ${place.isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
                aria-label={place.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
              >
                <Heart className={`h-4 w-4 ${place.isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          {/* カテゴリバッジ */}
          <div className="mb-2">
            <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded-full">
              {place.category}
            </span>
          </div>
          {/* 説明 */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{place.description}</p>
          {/* 基本情報 */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{place.address ? place.address : '未設定'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{place.openingHours}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{place.priceRange ? place.priceRange : '未設定'}</span>
            </div>
          </div>
          {/* 連絡先情報 */}
          {(place.phone || place.website) && (
            <div className="space-y-1 mb-4">
              {place.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{place.phone}</span>
                </div>
              )}
              {place.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="h-3 w-3" />
                  <a 
                    href={place.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {place.website}
                  </a>
                </div>
              )}
            </div>
          )}
          {/* 操作ボタン（下部）は削除 */}
        </div>
      </div>
      <PlaceDetailModal place={place} isOpen={showDetail} onClose={() => setShowDetail(false)} onEdit={() => { setShowDetail(false); onEdit(place); }} />
    </>
  );
};

export default PlaceCard; 