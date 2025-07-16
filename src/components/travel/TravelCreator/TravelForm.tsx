import React, { useEffect, useState } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { TravelFormData } from '../../../types/Travel';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';

/**
 * 旅行フォームコンポーネントのプロパティ
 * 
 * @param formData - フォームデータ
 * @param onFormDataChange - フォームデータ変更時のコールバック
 * @param onNext - AIプラン作成ボタンクリック時のコールバック
 * @param onManualCreate - 手動作成ボタンクリック時のコールバック
 */
interface TravelFormProps {
  formData: TravelFormData;
  onFormDataChange: (data: TravelFormData) => void;
  onNext: () => void;
  onManualCreate: () => void;
}

/**
 * 旅行フォームコンポーネント
 * 旅行の基本情報を入力するフォーム
 */
const TravelForm: React.FC<TravelFormProps> = ({
  formData,
  onFormDataChange,
  onNext,
  onManualCreate
}) => {
  /**
   * 興味オプションの定義
   */
  const interestOptions = [
    '歴史・文化', '自然・景色', 'グルメ', 'アクティビティ', 
    'ショッピング', '温泉・リラクゼーション', 'アート・美術', 
    'フォトスポット', 'ナイトライフ', 'ローカル体験'
  ];

  /**
   * 旅行スタイルオプションの定義
   */
  const travelStyleOptions = [
    { value: 'relaxed', label: 'リラックス重視', description: 'ゆったりとした時間を過ごしたい' },
    { value: 'balanced', label: 'バランス型', description: '観光とリラックスのバランスを取りたい' },
    { value: 'active', label: 'アクティブ', description: 'たくさんの場所を巡りたい' }
  ];

  /**
   * 入力フィールドの値を更新
   */
  const handleInputChange = (field: keyof TravelFormData, value: string | number) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  /**
   * 興味の選択を切り替え
   */
  const handleInterestToggle = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    onFormDataChange({
      ...formData,
      interests: newInterests
    });
  };

  /**
   * 日付のバリデーション
   */
  const validateDates = () => {
    if (!formData.startDate || !formData.endDate) {
      return { isValid: false, message: '' };
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 時刻をリセット

    // 開始日が今日より前の場合
    if (startDate < today) {
      return { 
        isValid: false, 
        message: '開始日は今日以降の日付を選択してください' 
      };
    }

    // 終了日が開始日より前の場合
    if (endDate < startDate) {
      return { 
        isValid: false, 
        message: '終了日は開始日以降の日付を選択してください' 
      };
    }

    // 旅行期間が長すぎる場合（例：1年以上）
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      return { 
        isValid: false, 
        message: '旅行期間は1年以内にしてください' 
      };
    }

    return { isValid: true, message: '' };
  };

  /**
   * 旅行期間を計算
   */
  const calculateTravelDuration = () => {
    if (!formData.startDate || !formData.endDate) {
      return { days: 0, nights: 0 };
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const nights = days - 1;

    return { days, nights };
  };

  /**
   * フォームのバリデーション（AIプラン生成に必要な項目だけ）
   */
  const isFormValid = () => {
    const dateValidation = validateDates();
    return (
      (formData.departure || '').trim() !== '' &&
      (formData.arrival || '').trim() !== '' &&
      formData.startDate !== '' &&
      formData.endDate !== '' &&
      formData.memberCount > 0 &&
      formData.budget > 0 &&
      dateValidation.isValid
    );
  };

  /**
   * 最小終了日の計算
   */
  const getMinEndDate = () => {
    return formData.startDate || '';
  };

  /**
   * 最大開始日の計算（終了日が設定されている場合）
   */
  const getMaxStartDate = () => {
    return formData.endDate || '';
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // 出発地と到着地が同じかどうかのstate
  const [samePlace, setSamePlace] = useState(true);

  // 初期値セット
  useEffect(() => {
    let changed = false;
    let newData = { ...formData };
    if (!formData.startDate) {
      newData.startDate = formatDate(today);
      changed = true;
    }
    if (!formData.endDate) {
      newData.endDate = formatDate(tomorrow);
      changed = true;
    }
    if (!formData.arrival) {
      newData.arrival = formData.departure;
      changed = true;
    }
    if (changed) {
      onFormDataChange(newData);
    }
    // eslint-disable-next-line
  }, []);

  // 出発地変更時、同じなら到着地も同期
  const handleDepartureChange = (value: string) => {
    if (samePlace) {
      onFormDataChange({ ...formData, departure: value, arrival: value });
    } else {
      onFormDataChange({ ...formData, departure: value });
    }
  };

  // 同じチェック切り替え時
  const handleSamePlaceToggle = (checked: boolean) => {
    setSamePlace(checked);
    if (checked) {
      onFormDataChange({ ...formData, arrival: formData.departure });
    }
  };

  const dateValidation = validateDates();
  const { days, nights } = calculateTravelDuration();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">旅行の基本情報</h2>
        
        <div className="space-y-6">
          {/* タイトル */}
          <Input
            label="旅行タイトル"
            value={formData.title}
            onChange={(value) => handleInputChange('title', value)}
            placeholder="例: 沖縄グループ旅行 2024"
            required
          />

          {/* 出発地 */}
          <Input
            label="出発地"
            value={formData.departure}
            onChange={handleDepartureChange}
            placeholder="例: 東京駅"
            required
          />
          {/* 出発地と到着地が同じか */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="samePlace"
              checked={samePlace}
              onChange={e => handleSamePlaceToggle(e.target.checked)}
            />
            <label htmlFor="samePlace">出発地と到着地は同じ</label>
          </div>
          {/* 到着地（同じでない場合のみ表示） */}
          {!samePlace && (
            <Input
              label="到着地"
              value={formData.arrival}
              onChange={value => onFormDataChange({ ...formData, arrival: value })}
              placeholder="例: 大阪駅"
              required
            />
          )}
          {/* 目的地（空欄でもOK） */}
          <Input
            label="目的地（空欄の場合はAIが提案）"
            value={formData.destination || ''}
            onChange={value => onFormDataChange({ ...formData, destination: value })}
            placeholder="例: 京都、沖縄、北海道 など（空欄可）"
          />
          {/* 移動手段（記入式） */}
          <Input
            label="移動手段"
            value={formData.transportation}
            onChange={value => onFormDataChange({ ...formData, transportation: value })}
            placeholder="例: ドライブ、電車、バスなど自由記入"
          />
          {/* 観光テーマ（記入式） */}
          <Input
            label="観光テーマ"
            value={formData.theme}
            onChange={value => onFormDataChange({ ...formData, theme: value })}
            placeholder="例: グルメ、絶景、温泉、歴史、アートなど自由記入"
          />
          {/* 日付 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="開始日"
              type="date"
              value={formData.startDate}
              onChange={(value) => handleInputChange('startDate', value)}
              min={formatDate(today)}
              required
            />
            <Input
              label="終了日"
              type="date"
              value={formData.endDate}
              onChange={(value) => handleInputChange('endDate', value)}
              min={formData.startDate || formatDate(today)}
              required
            />
          </div>

          {/* 旅行期間の表示 */}
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">旅行期間</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    {nights}泊{days}日
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600 dark:text-blue-300">宿泊日数</p>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{nights}泊</p>
                </div>
              </div>
            </div>
          )}

          {/* 日付エラーメッセージ */}
          {!dateValidation.isValid && dateValidation.message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 dark:bg-red-900 dark:border-red-700">
              <p className="text-red-800 dark:text-red-100 text-sm">{dateValidation.message}</p>
            </div>
          )}

          {/* 参加人数と予算 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="参加人数"
              type="number"
              value={formData.memberCount}
              onChange={(value) => handleInputChange('memberCount', parseInt(value) || 1)}
              min={1}
              required
            />
            <Input
              label="予算（円）"
              type="number"
              value={formData.budget}
              onChange={(value) => handleInputChange('budget', parseInt(value) || 0)}
              min={0}
              required
            />
          </div>

          {/* 旅行タイプ */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              旅行タイプ
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="travelType"
                  value="domestic"
                  checked={formData.travelType === 'domestic'}
                  onChange={(e) => handleInputChange('travelType', e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">国内旅行</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">日本国内の旅行</div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="travelType"
                  value="international"
                  checked={formData.travelType === 'international'}
                  onChange={(e) => handleInputChange('travelType', e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">海外旅行</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">海外への旅行</div>
                </div>
              </label>
            </div>
          </div>

          {/* 興味 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              興味のある分野（複数選択可）
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`
                    px-3 py-2 text-sm rounded-lg border transition-colors
                    ${formData.interests.includes(interest)
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* 旅行スタイル */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              旅行スタイル
            </label>
            <div className="space-y-2">
              {travelStyleOptions.map((style) => (
                <label key={style.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="travelStyle"
                    value={style.value}
                    checked={formData.travelStyle === style.value}
                    onChange={(e) => handleInputChange('travelStyle', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{style.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{style.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 説明 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              旅行の説明（任意）
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="旅行の目的や希望する体験について記入してください"
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>

          {/* 作成方法選択ボタン */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => { console.log("Manual creation clicked"); onManualCreate(); }}
              disabled={!isFormValid()}
            >
              <EditIcon className="h-5 w-5 mr-2" />
              手動で作成
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => { console.log("AI creation clicked"); onNext(); }}
              disabled={!isFormValid()}
            >
              <AutoAwesomeIcon className="h-5 w-5 mr-2" />
              AIでプラン作成
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelForm; 