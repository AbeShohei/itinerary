import React from 'react';
import { Sparkles } from 'lucide-react';

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
 * AI設定コンポーネントのプロパティ
 * 
 * @param preferences - 旅行設定
 * @param onPreferencesChange - 設定変更時のコールバック
 */
interface AIPreferencesProps {
  preferences: TravelPreferences;
  onPreferencesChange: (preferences: TravelPreferences) => void;
}

/**
 * AI旅行アシスタント設定コンポーネント
 * 旅行の好みや条件を設定
 */
const AIPreferences: React.FC<AIPreferencesProps> = ({
  preferences,
  onPreferencesChange
}) => {
  /**
   * 興味カテゴリーの切り替え
   */
  const toggleInterest = (interest: string) => {
    const newInterests = preferences.interests.includes(interest)
      ? preferences.interests.filter(i => i !== interest)
      : [...preferences.interests, interest];
    
    onPreferencesChange({
      ...preferences,
      interests: newInterests
    });
  };

  /**
   * 数値フィールドの更新
   */
  const updateNumberField = (field: keyof TravelPreferences, value: string) => {
    const numValue = parseInt(value) || 0;
    onPreferencesChange({
      ...preferences,
      [field]: numValue
    });
  };

  /**
   * 文字列フィールドの更新
   */
  const updateStringField = (field: keyof TravelPreferences, value: string) => {
    onPreferencesChange({
      ...preferences,
      [field]: value
    });
  };

  const interestOptions = ['歴史・文化', '自然・景色', 'グルメ', 'アクティビティ', 'ショッピング'];

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">AI旅行アシスタント</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 興味のあるカテゴリー */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            興味のあるカテゴリー
          </label>
          <div className="space-y-2">
            {interestOptions.map(interest => (
              <label key={interest} className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={preferences.interests.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">{interest}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* 予算レベル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            予算レベル
          </label>
          <select 
            value={preferences.budget}
            onChange={(e) => updateStringField('budget', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            title="予算レベルを選択"
          >
            <option value="low">節約重視</option>
            <option value="medium">標準</option>
            <option value="high">贅沢</option>
          </select>
        </div>
        
        {/* 旅行スタイル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            旅行スタイル
          </label>
          <select 
            value={preferences.travelStyle}
            onChange={(e) => updateStringField('travelStyle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            title="旅行スタイルを選択"
          >
            <option value="relaxed">ゆったり</option>
            <option value="balanced">バランス</option>
            <option value="packed">アクティブ</option>
          </select>
        </div>
        
        {/* グループ人数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            グループ人数
          </label>
          <input 
            type="number" 
            value={preferences.groupSize}
            onChange={(e) => updateNumberField('groupSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            min="1" 
            max="20"
            title="グループ人数"
            placeholder="グループ人数"
          />
        </div>
      </div>
      
      {/* こだわり・要望（自由記述） */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          こだわり・要望（自由記述）
        </label>
        <textarea
          value={preferences.customNote || ''}
          onChange={e => updateStringField('customNote', e.target.value)}
          placeholder="例：絶対に海が見えるホテルがいい／地元グルメをたくさん食べたい など"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          title="こだわり・要望（自由記述）"
        />
      </div>

      {/* 領域入力欄 */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          領域（都道府県・州・国など）
        </label>
        <input
          type="text"
          value={preferences.region || ''}
          onChange={e => onPreferencesChange({ ...preferences, region: e.target.value })}
          placeholder="例：ネバダ州, アメリカ／広島県／カリフォルニア州"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          title="領域"
        />
      </div>
    </div>
  );
};

export default AIPreferences; 