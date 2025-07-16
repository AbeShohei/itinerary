import React, { useState, useEffect, useRef } from 'react';
import { Plus, Settings, Globe, MapPin } from 'lucide-react';
import PackingProgress from './PackingProgress';
import PackingItemComponent from './PackingItem';
import PackingItemForm from './PackingItemForm';
import Modal from '../../common/Modal';
import DeleteConfirmModal from '../TravelCatalog/DeleteConfirmModal';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { packingApi, PackingItem as PackingItemDB } from '../../../services/packingApi';

/**
 * パッキングアイテムの型定義
 */
interface PackingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  is_packed: boolean;
  is_essential: boolean;
}

/**
 * AI生成パッキングデータの型定義
 */
interface PackingData {
  name: string;
  category: string;
  quantity?: number;
  is_essential?: boolean;
}

/**
 * 旅行タイプの型定義
 */
type TravelType = 'domestic' | 'international';

/**
 * パッキングタブコンポーネントのプロパティ
 */
interface PackingTabProps {
  travelId: string;
  packingData?: PackingData[];
  travelType?: TravelType;
}

/**
 * 国内旅行の固定テンプレート
 */
const domesticTemplate: PackingItem[] = [
  { id: 'dom-1', name: '身分証明書', category: '書類', quantity: 1, is_packed: false, is_essential: true },
  { id: 'dom-2', name: '現金・クレジットカード', category: '書類', quantity: 1, is_packed: false, is_essential: true },
  { id: 'dom-3', name: 'Tシャツ', category: '衣類', quantity: 3, is_packed: false, is_essential: false },
  { id: 'dom-4', name: 'ズボン・スカート', category: '衣類', quantity: 2, is_packed: false, is_essential: false },
  { id: 'dom-5', name: '下着', category: '衣類', quantity: 3, is_packed: false, is_essential: false },
  { id: 'dom-6', name: '靴下', category: '衣類', quantity: 3, is_packed: false, is_essential: false },
  { id: 'dom-7', name: 'パジャマ', category: '衣類', quantity: 1, is_packed: false, is_essential: false },
  { id: 'dom-8', name: '歯ブラシ・歯磨き粉', category: '美容・健康', quantity: 1, is_packed: false, is_essential: true },
  { id: 'dom-9', name: 'シャンプー・ボディソープ', category: '美容・健康', quantity: 1, is_packed: false, is_essential: false },
  { id: 'dom-10', name: 'タオル', category: '美容・健康', quantity: 1, is_packed: false, is_essential: true },
  { id: 'dom-11', name: 'スマートフォン', category: '電子機器', quantity: 1, is_packed: false, is_essential: true },
  { id: 'dom-12', name: '充電器', category: '電子機器', quantity: 1, is_packed: false, is_essential: true },
  { id: 'dom-13', name: 'モバイルバッテリー', category: '電子機器', quantity: 1, is_packed: false, is_essential: false },
  { id: 'dom-14', name: 'カメラ', category: '電子機器', quantity: 1, is_packed: false, is_essential: false },
  { id: 'dom-15', name: '常備薬', category: '美容・健康', quantity: 1, is_packed: false, is_essential: true },
  { id: 'dom-16', name: '日焼け止め', category: '美容・健康', quantity: 1, is_packed: false, is_essential: false },
  { id: 'dom-17', name: 'サングラス', category: 'アクセサリー', quantity: 1, is_packed: false, is_essential: false },
  { id: 'dom-18', name: '帽子', category: 'アクセサリー', quantity: 1, is_packed: false, is_essential: false },
  { id: 'dom-19', name: '傘', category: 'その他', quantity: 1, is_packed: false, is_essential: false },
  { id: 'dom-20', name: 'ゴミ袋', category: 'その他', quantity: 3, is_packed: false, is_essential: false }
];

/**
 * 海外旅行の固定テンプレート
 */
const internationalTemplate: PackingItem[] = [
  { id: 'int-1', name: 'パスポート', category: '書類', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-2', name: 'ビザ（必要に応じて）', category: '書類', quantity: 1, is_packed: false, is_essential: false },
  { id: 'int-3', name: '航空券', category: '書類', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-4', name: '海外旅行保険証書', category: '書類', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-5', name: '国際運転免許証（必要に応じて）', category: '書類', quantity: 1, is_packed: false, is_essential: false },
  { id: 'int-6', name: '現金（現地通貨）', category: '書類', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-7', name: 'クレジットカード', category: '書類', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-8', name: 'Tシャツ', category: '衣類', quantity: 5, is_packed: false, is_essential: false },
  { id: 'int-9', name: 'ズボン・スカート', category: '衣類', quantity: 3, is_packed: false, is_essential: false },
  { id: 'int-10', name: '下着', category: '衣類', quantity: 5, is_packed: false, is_essential: false },
  { id: 'int-11', name: '靴下', category: '衣類', quantity: 5, is_packed: false, is_essential: false },
  { id: 'int-12', name: 'パジャマ', category: '衣類', quantity: 1, is_packed: false, is_essential: false },
  { id: 'int-13', name: '歯ブラシ・歯磨き粉', category: '美容・健康', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-14', name: 'シャンプー・ボディソープ', category: '美容・健康', quantity: 1, is_packed: false, is_essential: false },
  { id: 'int-15', name: 'タオル', category: '美容・健康', quantity: 2, is_packed: false, is_essential: true },
  { id: 'int-16', name: 'スマートフォン', category: '電子機器', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-17', name: '充電器', category: '電子機器', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-18', name: 'モバイルバッテリー', category: '電子機器', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-19', name: 'カメラ', category: '電子機器', quantity: 1, is_packed: false, is_essential: false },
  { id: 'int-20', name: '変換プラグ', category: '電子機器', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-21', name: '常備薬', category: '美容・健康', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-22', name: '日焼け止め', category: '美容・健康', quantity: 1, is_packed: false, is_essential: true },
  { id: 'int-23', name: '虫除けスプレー', category: '美容・健康', quantity: 1, is_packed: false, is_essential: false },
  { id: 'int-24', name: 'サングラス', category: 'アクセサリー', quantity: 1, is_packed: false, is_essential: false },
  { id: 'int-25', name: '帽子', category: 'アクセサリー', quantity: 1, is_packed: false, is_essential: false },
  { id: 'int-26', name: '傘', category: 'その他', quantity: 1, is_packed: false, is_essential: false },
  { id: 'int-27', name: 'ゴミ袋', category: 'その他', quantity: 5, is_packed: false, is_essential: false },
  { id: 'int-28', name: '辞書・翻訳アプリ', category: 'その他', quantity: 1, is_packed: false, is_essential: false },
  { id: 'int-29', name: '現地の地図', category: 'その他', quantity: 1, is_packed: false, is_essential: false }
];

/**
 * パッキングタブコンポーネント
 * パッキングリストの管理、アイテムの追加・編集・削除機能を提供
 */
const PackingTab: React.FC<PackingTabProps> = ({ travelId, packingData, travelType = 'domestic' }) => {
  const [items, setItems] = useState<PackingItemDB[]>([]);
  const [categories, setCategories] = useState<string[]>([
    '書類', '衣類', '美容・健康', 'アクセサリー', '電子機器', 'その他'
  ]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItemDB | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const initializedRef = useRef(false);

  // Supabaseから持ち物リストを取得
  const fetchPackingItems = async () => {
    if (!travelId) return;
    try {
      const data = await packingApi.getPackingItems(travelId);
      setItems(data);
    } catch (e) {
      alert('持ち物リストの取得に失敗しました');
      console.error(e);
    }
  };

  // 初期ロード・DBにデータがなければテンプレートをinsert
  useEffect(() => {
    if (!travelId || initializedRef.current) return;
    initializedRef.current = true;
    (async () => {
      try {
        const items = await packingApi.getPackingItems(travelId);
        setItems(items);
      } catch (e) {
        alert('持ち物リストの初期化に失敗しました');
        console.error(e);
      }
    })();
    // eslint-disable-next-line
  }, [travelId, travelType, JSON.stringify(packingData)]);

  // パッキング状態切り替え
  const togglePacked = async (id: string) => {
    if (!travelId) return;
    const item = items.find(i => i.id === id);
    if (!item) return;
    try {
      await packingApi.updatePackingItem(id, { is_packed: !item.is_packed });
      await fetchPackingItems();
    } catch (e) {
      alert('パッキング状態の更新に失敗しました');
      console.error(e);
    }
  };

  // アイテム追加
  const handleAddItem = () => {
    setShowAddItemModal(true);
  };

  // アイテム編集
  const handleEditItem = (item: PackingItemDB) => {
    setEditingItem(item);
    setShowEditItemModal(true);
  };

  // アイテム削除
  const handleDeleteClick = (itemId: string) => {
    setDeletingItemId(itemId);
    setShowDeleteConfirm(true);
  };

  // アイテム削除
  const confirmDelete = async () => {
    if (!deletingItemId || !travelId) return;
    try {
      await packingApi.deletePackingItem(deletingItemId);
      setShowDeleteConfirm(false);
      setDeletingItemId(null);
      await fetchPackingItems();
    } catch (e) {
      alert('持ち物の削除に失敗しました');
      console.error(e);
    }
  };

  // アイテム追加
  const saveNewItem = async (item: PackingItemDB) => {
    if (!travelId) return;
    try {
      await packingApi.createPackingItem({
        travel_id: travelId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        is_packed: item.is_packed,
        is_essential: item.is_essential
      });
      setShowAddItemModal(false);
      await fetchPackingItems();
    } catch (e) {
      alert('持ち物の追加に失敗しました');
      console.error(e);
    }
  };

  // アイテム編集
  const saveEditedItem = async (item: PackingItemDB) => {
    if (!travelId) return;
    try {
      await packingApi.updatePackingItem(item.id!, {
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        is_essential: item.is_essential,
        is_packed: item.is_packed
      });
      setShowEditItemModal(false);
      setEditingItem(null);
      await fetchPackingItems();
    } catch (e) {
      alert('持ち物の更新に失敗しました');
      console.error(e);
    }
  };

  // カテゴリ追加・削除はローカルのみ
  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      setShowAddCategoryModal(false);
    }
  };
  const deleteCategory = (category: string) => {
    if (category !== 'その他') {
      setCategories(categories.filter(cat => cat !== category));
      // DB上のカテゴリ変更は個別編集で対応
    }
  };
  const getDeletingItemName = () => {
    const item = items.find(i => i.id === deletingItemId);
    return item?.name || '';
  };

  // 進捗計算
  const packedCount = items.filter(item => item.is_packed).length;
  const totalCount = items.length;
  const essentialUnpacked = items.filter(item => item.is_essential && !item.is_packed);

  return (
    <div className="space-y-6">
      {/* パッキング進捗 */}
      <PackingProgress
        packedCount={packedCount}
        totalCount={totalCount}
        essentialUnpacked={essentialUnpacked.length}
        essentialUnpackedList={essentialUnpacked}
      />

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">パッキングリスト</h2>
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {travelType === 'international' ? (
              <>
                <Globe className="h-3 w-3" />
                <span>海外旅行</span>
              </>
            ) : (
              <>
                <MapPin className="h-3 w-3" />
                <span>国内旅行</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {/* スマホ：丸アイコンボタン */}
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="flex items-center justify-center bg-gray-200 text-gray-700 rounded-full w-10 h-10 shadow-md hover:bg-gray-300 transition-colors sm:hidden"
            aria-label="カテゴリ管理"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={handleAddItem}
            className="flex items-center justify-center bg-blue-600 text-white rounded-full w-10 h-10 shadow-md hover:bg-blue-700 transition-colors sm:hidden"
            aria-label="アイテムを追加"
          >
            <Plus className="h-5 w-5" />
          </button>
          {/* PC：テキスト付きボタン */}
          <Button
            variant="secondary"
            onClick={() => setShowAddCategoryModal(true)}
            className="hidden sm:flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">カテゴリ管理</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleAddItem}
            className="hidden sm:flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">アイテムを追加</span>
          </Button>
        </div>
      </div>

      {/* アイテムリスト */}
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <PackingItemComponent
              key={item.id}
              item={item}
              onTogglePacked={togglePacked}
              onEdit={handleEditItem}
              onDelete={handleDeleteClick}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">パッキングアイテムがありません</p>
            <p className="text-sm text-gray-400 mt-1">「アイテムを追加」ボタンからアイテムを追加してください</p>
          </div>
        )}
      </div>

      {/* アイテム追加モーダル */}
      <Modal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        title="新しいアイテムを追加"
        size="md"
      >
        <PackingItemForm
          item={null}
          categories={categories}
          onSave={saveNewItem}
          onCancel={() => setShowAddItemModal(false)}
        />
      </Modal>

      {/* アイテム編集モーダル */}
      <Modal
        isOpen={showEditItemModal}
        onClose={() => {
          setShowEditItemModal(false);
          setEditingItem(null);
        }}
        title="アイテムを編集"
        size="md"
      >
        <PackingItemForm
          item={editingItem}
          categories={categories}
          onSave={saveEditedItem}
          onCancel={() => {
            setShowEditItemModal(false);
            setEditingItem(null);
          }}
        />
      </Modal>

      {/* カテゴリ管理モーダル */}
      <Modal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setNewCategory('');
        }}
        title="カテゴリ管理"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">新しいカテゴリを追加</h4>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(value) => setNewCategory(value)}
                placeholder="カテゴリ名を入力"
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={addCategory}
                disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
              >
                追加
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">既存のカテゴリ</h4>
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>{category}</span>
                  {category !== 'その他' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteCategory(category)}
                    >
                      削除
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title={getDeletingItemName()}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingItemId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PackingTab; 