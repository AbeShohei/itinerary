import React, { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { Place } from '../../../services/travelApi';

/**
 * 観光スポットの型定義
 */
interface Place {
  id: string;
  name: string;
  category: string;
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

// Place型の定義の直後にformData型を拡張
interface PlaceFormData extends Place {
  mainCategory?: string;
}

/**
 * 観光スポットフォームコンポーネントのプロパティ
 * 
 * @param place - 編集対象の観光スポット（新規作成時はnull）
 * @param onSave - 保存時のコールバック
 * @param onCancel - キャンセル時のコールバック
 */
interface PlaceFormProps {
  place: Place | null;
  onSave: (place: Place) => void;
  onCancel: () => void;
}

/**
 * 観光スポットフォームコンポーネント
 * 観光スポットの追加・編集フォームを提供
 */
const PlaceForm: React.FC<PlaceFormProps> = ({ place, onSave, onCancel }) => {
  // フォームデータ
  const [formData, setFormData] = useState<Partial<PlaceFormData>>({
    name: '',
    category: '史跡・遺跡',
    rating: 4.0,
    image: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    openingHours: '',
    priceRange: '',
    isFavorite: false
  });

  // カテゴリオプション
  const categories = [
    '史跡・遺跡', 'テーマパーク', '自然・景勝地', 'グルメ', 
    'ショッピング', '温泉・スパ', 'アクティビティ', 'その他'
  ];

  // メインカテゴリ選択肢
  const mainCategories = ['観光', '食事', '交通', '宿泊', 'その他'];

  // サブカテゴリ→メインカテゴリのマッピング
  const subToMainCategory: { [key: string]: string } = {
    '史跡・遺跡': '観光',
    'テーマパーク': '観光',
    '自然・景勝地': '観光',
    'ショッピング': '観光',
    '温泉・スパ': '観光',
    'アクティビティ': '観光',
    'グルメ': '食事',
    '交通': '交通',
    '宿泊': '宿泊',
    'その他': '観光',
  };

  /**
   * 編集時に入力データを初期化
   */
  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name,
        category: place.category,
        rating: place.rating,
        image: place.image,
        description: place.description,
        address: place.address,
        phone: place.phone || '',
        website: place.website || '',
        openingHours: place.openingHours,
        priceRange: place.priceRange,
        isFavorite: place.isFavorite
      });
    }
  }, [place]);

  /**
   * 入力フィールドの値を更新
   */
  const handleInputChange = (field: keyof PlaceFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * フォームのバリデーション
   */
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.description?.trim() !== '' &&
      formData.category?.trim() !== ''
    );
  };

  /**
   * 保存処理
   */
  const handleSave = () => {
    if (isFormValid()) {
      let newPlace: Partial<Place> = {
        name: formData.name!,
        category: formData.category!,
        mainCategory: formData.mainCategory!,
        rating: formData.rating!,
        image: formData.image || 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: formData.description!,
        address: formData.address!,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        openingHours: formData.openingHours!,
        priceRange: formData.priceRange!,
        isFavorite: formData.isFavorite || false
      };
      if (place?.id) {
        newPlace = { ...newPlace, id: place.id };
      }
      onSave(newPlace as Place);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {place ? '観光スポットを編集' : '新しい観光スポットを追加'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本情報 */}
        <div className="space-y-4">
          {/* スポット名 */}
          <Input
            label="スポット名"
            value={formData.name || ''}
            onChange={(value) => handleInputChange('name', value)}
            placeholder="例: 首里城"
            required
          />
          {/* 説明（textareaのみ残す） */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              説明
            </label>
            <textarea
              value={formData.description || ''}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="例: 世界遺産の城跡"
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="category-input" className="block text-sm font-medium text-gray-700">
              カテゴリ（バッジ表示・10文字まで）
            </label>
            <input
              id="category-input"
              type="text"
              maxLength={10}
              value={formData.category || ''}
              onChange={e => handleInputChange('category', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: 史跡・遺跡"
              required
            />
          </div>
          
          {/* カテゴリ入力部分の直後にメインカテゴリ選択を追加 */}
          <div className="space-y-1">
            <label htmlFor="main-category-select" className="block text-sm font-medium text-gray-700">
              メインカテゴリ（グループ見出し用）
            </label>
            <select
              id="main-category-select"
              value={formData.mainCategory || ''}
              onChange={e => handleInputChange('mainCategory', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>選択してください</option>
              {mainCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="rating-select" className="block text-sm font-medium text-gray-700">
              評価
            </label>
            <select
              id="rating-select"
              value={formData.rating}
              onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map(rating => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </div>
          
          <Input
            label="画像URL"
            value={formData.image || ''}
            onChange={(value) => handleInputChange('image', value)}
            placeholder="画像のURLを入力（任意）"
          />
          <div className="my-2 text-center text-sm text-gray-500">または</div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">画像ファイルを選択</label>
            <input
              type="file"
              accept="image/*"
              title="画像ファイルを選択"
              placeholder="画像ファイルを選択"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    handleInputChange('image', ev.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2"
            />
            {formData.image && (formData.image.startsWith('data:image') || formData.image.startsWith('http')) && (
              <img src={formData.image} alt="プレビュー" className="w-32 h-32 object-cover mt-2 rounded border mx-auto" />
            )}
          </div>
        </div>
        
        {/* 詳細情報 */}
        <div className="space-y-4">
          <Input
            label="住所"
            value={formData.address || ''}
            onChange={(value) => handleInputChange('address', value)}
            placeholder="例: 沖縄県那覇市首里金城町1-2"
          />
          
          <Input
            label="電話番号"
            value={formData.phone || ''}
            onChange={(value) => handleInputChange('phone', value)}
            placeholder="例: 098-886-2020"
          />
          
          <Input
            label="ウェブサイト"
            value={formData.website || ''}
            onChange={(value) => handleInputChange('website', value)}
            placeholder="例: https://example.com"
          />
          
          <Input
            label="営業時間"
            value={formData.openingHours || ''}
            onChange={(value) => handleInputChange('openingHours', value)}
            placeholder="例: 9:00-17:00"
          />
          
          <Input
            label="料金"
            value={formData.priceRange || ''}
            onChange={(value) => handleInputChange('priceRange', value)}
            placeholder="例: 1000"
          />
        </div>
      </div>
      
      {/* ボタン群 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isFormValid()}
        >
          {place ? '更新' : '追加'}
        </Button>
      </div>
    </div>
  );
};

export default PlaceForm; 