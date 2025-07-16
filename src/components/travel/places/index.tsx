import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Place } from '../../../services/travelApi';
import PlaceCard from './PlaceCard';
import PlaceForm from './PlaceForm';
import Modal from '../../common/Modal';
import DeleteConfirmModal from '../TravelCatalog/DeleteConfirmModal';
import Button from '../../common/Button';
import PlaceDetailModal from './PlaceDetailModal';

/**
 * 観光スポットの型定義
 */
interface Place {
  id: string;
  name: string;
  mainCategory: string; // 観光/交通/食事/宿泊
  category: string; // 史跡・遺跡/テーマパーク/グルメ等
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
 * 観光スポットタブコンポーネントのプロパティ
 * 
 * @param initialPlaces - 初期の観光スポットリスト
 */
interface PlacesTabProps {
  places: Place[];
  setPlaces: (places: Place[]) => void;
}

/**
 * 観光スポットタブコンポーネント
 * 観光スポットの一覧表示、追加、編集、削除機能を提供
 */
const PlacesTab: React.FC<PlacesTabProps & { placeDetailId?: string, setPlaceDetailId?: (id: string | null) => void }> = ({ places, setPlaces, placeDetailId, setPlaceDetailId }) => {
  // 観光スポットデータの状態
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [deletingPlaceId, setDeletingPlaceId] = useState<string | null>(null);

  React.useEffect(() => {
    if (placeDetailId) {
      const found = places.find(p => p.id === placeDetailId);
      if (found) {
        setEditingPlace(found);
        // setShowEditModal(true); // ← これを削除
      }
    }
  }, [placeDetailId, places]);

  // カテゴリフィルター関連のstate・UI・ロジックを削除
  // 1. selectedCategory, categories, setSelectedCategory, category-filter selectタグ、filteredPlaces, filteredPlacesWithMain, withMainCategory, groupByMainCategory, groupedPlaces などを削除
  // 2. placesをそのまま表示するだけに変更

  /**
   * お気に入り切り替え
   */
  const toggleFavorite = (id: string) => {
    setPlaces(places.map(place => 
      place.id === id ? { ...place, isFavorite: !place.isFavorite } : place
    ));
  };

  /**
   * 観光スポット追加
   */
  const handleAddPlace = () => {
    setShowAddModal(true);
  };

  /**
   * 観光スポット編集
   */
  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setShowEditModal(true);
  };

  /**
   * 観光スポット削除
   */
  const handleDeleteClick = (placeId: string) => {
    setDeletingPlaceId(placeId);
    setShowDeleteConfirm(true);
  };

  /**
   * 削除確認
   */
  const confirmDelete = () => {
    if (deletingPlaceId) {
      console.log('削除対象ID:', deletingPlaceId);
      console.log('placesのIDリスト:', places.map(p => p.id));
      setPlaces(prev => prev.filter(place => String(place.id) !== String(deletingPlaceId)));
    }
    setShowDeleteConfirm(false);
    setDeletingPlaceId(null);
  };

  /**
   * 新しい観光スポットを保存
   */
  const saveNewPlace = (place: Place) => {
    setPlaces(prev => [...prev, place]);
    setShowAddModal(false);
  };

  /**
   * 編集した観光スポットを保存
   */
  const saveEditedPlace = (place: Place) => {
    setPlaces(prev => prev.map(p => p.id === place.id ? place : p));
    setShowEditModal(false);
    setEditingPlace(null);
  };

  /**
   * 削除対象の観光スポット名を取得
   */
  const getDeletingPlaceName = () => {
    const place = places.find((p: Place) => p.id === deletingPlaceId);
    return place?.name || '';
  };

  // mainCategoryでグループ化する関数を追加
  const groupByMainCategory = (places: Place[]) => {
    const map: { [key: string]: Place[] } = {};
    for (const place of places) {
      const mainCat = place.mainCategory || 'その他';
      if (!map[mainCat]) map[mainCat] = [];
      map[mainCat].push(place);
    }
    return map;
  };
  const groupedPlaces = groupByMainCategory(places);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">観光スポット</h2>
        <Button
          variant="primary"
          onClick={handleAddPlace}
        >
          <Plus className="h-4 w-4 mr-2" />
          新しい観光スポットを追加
        </Button>
      </div>

      {/* mainCategoryごとにグループ化して見出し表示 */}
      {Object.entries(groupedPlaces).map(([mainCategory, placesInCategory]) => (
        <div key={mainCategory} className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{mainCategory}</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {placesInCategory.map((place, index) => (
              <PlaceCard
                key={place.id || `place-${index}`}
                place={place}
                onToggleFavorite={toggleFavorite}
                onEdit={handleEditPlace}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 観光スポットが見つからない場合のメッセージ */}
      {places.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            観光スポットがありません。新しいスポットを追加してみましょう！
          </p>
        </div>
      )}

      {/* 追加モーダル */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新しい観光スポットを追加"
        size="lg"
      >
        <PlaceForm
          place={null}
          onSave={saveNewPlace}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPlace(null);
          if (setPlaceDetailId) setPlaceDetailId(null);
        }}
        title="観光スポットを編集"
        size="lg"
      >
        <PlaceForm
          place={editingPlace}
          onSave={saveEditedPlace}
          onCancel={() => {
            setShowEditModal(false);
            setEditingPlace(null);
          }}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title={getDeletingPlaceName()}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingPlaceId(null);
        }}
        onConfirm={confirmDelete}
      />

      {/* 詳細モーダル */}
      {placeDetailId && editingPlace && (
        <PlaceDetailModal
          place={editingPlace}
          isOpen={!!placeDetailId}
          onClose={() => setPlaceDetailId && setPlaceDetailId(null)}
          onEdit={() => {
            setShowEditModal(true);
            setPlaceDetailId && setPlaceDetailId(null);
          }}
        />
      )}
    </div>
  );
};

export default PlacesTab; 