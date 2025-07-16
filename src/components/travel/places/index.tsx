import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Place, placeApi } from '../../../services/travelApi';
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
  travel_id: string; // キャメル→スネーク
  onTravelInfoUpdate?: (travel: any) => void;
}

/**
 * 観光スポットタブコンポーネント
 * 観光スポットの一覧表示、追加、編集、削除機能を提供
 */
const PlacesTab: React.FC<PlacesTabProps & { placeDetailId?: string, setPlaceDetailId?: (id: string | null) => void }> = ({ places, setPlaces, travel_id, placeDetailId, setPlaceDetailId, onTravelInfoUpdate }) => {
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

  // 追加: APIから観光スポットリストを取得する関数
  const fetchPlaces = async () => {
    try {
      const data = await placeApi.getPlaces(travel_id);
      setPlaces(data);
    } catch (e) {
      console.error('観光スポットの取得に失敗しました', e);
    }
  };

  // travel_idが変わったらリストを再取得
  React.useEffect(() => {
    fetchPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travel_id]);

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

  const isUuid = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

  /**
   * 削除確認
   */
  const confirmDelete = async () => {
    if (deletingPlaceId) {
      if (isUuid(deletingPlaceId)) {
        await placeApi.deletePlace(deletingPlaceId);
      }
      await fetchPlaces();
    }
    setShowDeleteConfirm(false);
    setDeletingPlaceId(null);
  };

  /**
   * 新しい観光スポットを保存
   */
  const saveNewPlace = async (place: Place) => {
    // idを除去し、テーブルに存在するカラムだけ抽出し、travel_idを必ずセット
    const { id, image, address, phone, website, openingHours, priceRange, isFavorite, mainCategory, ...rest } = place;
    await placeApi.createPlace({ ...rest, travel_id, mainCategory });
    await fetchPlaces();
    setShowAddModal(false);
  };

  /**
   * 編集した観光スポットを保存
   */
  const saveEditedPlace = async (place: Place) => {
    if (!place.id) return;
    // テーブルに存在するカラムだけ抽出
    const {
      id, travel_id, schedule_id, name, category, rating, description, created_at, updated_at, mainCategory
    } = place;
    const updateObj = { travel_id, schedule_id, name, category, rating, description, created_at, updated_at, mainCategory };
    await placeApi.updatePlace(id, updateObj);
    await fetchPlaces();
    setShowEditModal(false);
    setEditingPlace(null);
    // 親のtravelInfoも更新
    if (onTravelInfoUpdate) {
      onTravelInfoUpdate((prev: any) => {
        if (!prev) return prev;
        return { ...prev, places: prev.places.map((p: any) => p.id === place.id ? place : p) };
      });
    }
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