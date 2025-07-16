import React, { useState } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { travelApi } from '../../../services/travelApi';
import { memberApi, Member } from '../../../services/memberApi';

/**
 * メンバーの型定義
 */
interface Member {
  id: string;
  name: string;
  gender: 'male' | 'female';
  preferences: string[];
}

/**
 * メンバーフォームコンポーネントのプロパティ
 * 
 * @param onSave - 保存時のコールバック
 * @param onCancel - キャンセル時のコールバック
 * @param initialData - 初期データ
 * @param isEdit - 編集フラグ
 */
interface MemberFormProps {
  onSave: (member: Member | Member[]) => void;
  onCancel: () => void;
  initialData?: Member;
  isEdit?: boolean;
}

/**
 * メンバーフォームコンポーネント
 * メンバーの追加フォームを提供
 */
const MemberForm: React.FC<MemberFormProps> = ({ onSave, onCancel, initialData, isEdit }) => {
  // フォームデータ
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    gender: (initialData?.gender as 'male' | 'female') || 'male',
    preferences: initialData?.preferences || []
  });

  const [loading, setLoading] = useState(false);

  // 希望条件のオプション
  const preferenceOptions = [
    '静か', '景色重視', 'コスト重視', 'アクセス重視', '禁煙', 'Wi-Fi重視'
  ];

  /**
   * 入力フィールドの値を更新
   */
  const handleInputChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 希望条件の切り替え
   */
  const togglePreference = (preference: string) => {
    const newPreferences = formData.preferences.includes(preference)
      ? formData.preferences.filter(p => p !== preference)
      : [...formData.preferences, preference];
    handleInputChange('preferences', newPreferences);
  };

  /**
   * フォームのバリデーション
   */
  const isFormValid = () => {
    return formData.name.trim() !== '';
  };

  /**
   * 保存処理
   */
  const handleSave = async () => {
    if (isFormValid()) {
      if (isEdit && initialData) {
        await memberApi.updateMember(initialData.id, formData);
        onSave({ ...initialData, ...formData });
      } else {
        // travel_idは親から渡す or contextで取得
        // ここではonSaveでtravel_idを付与してもらう
        onSave(formData);
      }
    }
  };

  // 画像から人名を抽出してフォームに反映
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const names = await travelApi.extractNamesFromImage(base64);
        if (Array.isArray(names) && names.length > 0) {
          // 複数人まとめて追加
          const members = names.map(name => ({
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            name: name,
            gender: 'male',
            preferences: []
          }));
          onSave(members);
        } else {
          alert('画像から人名が検出できませんでした');
        }
      } catch (err) {
        alert('画像から人名抽出に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">{isEdit ? 'メンバーを編集' : '新しいメンバーを追加'}</h3>
      
      <div className="space-y-4">
        {/* 名前 */}
        <Input
          label="名前"
          value={formData.name}
          onChange={(value) => handleInputChange('name', value)}
          placeholder="例: 田中太郎"
          required
        />
        
        {/* 性別 */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            性別
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>男性</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>女性</span>
            </label>
          </div>
        </div>
        
        {/* 希望条件 */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            希望条件（複数選択可）
          </label>
          <div className="grid grid-cols-2 gap-2">
            {preferenceOptions.map(preference => (
              <label key={preference} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.preferences.includes(preference)}
                  onChange={() => togglePreference(preference)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{preference}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">画像から人名を追加</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} title="画像を選択" placeholder="画像を選択" />
        {loading && <div className="text-xs text-blue-600 mt-1">画像を解析中...</div>}
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
          追加
        </Button>
      </div>
    </div>
  );
};

export default MemberForm; 