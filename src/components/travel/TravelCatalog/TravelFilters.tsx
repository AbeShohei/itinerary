import React from 'react';

/**
 * フィルターの状態
 */
interface Filters {
  search: string;
  status: 'all' | 'planning' | 'confirmed' | 'completed';
  destination: 'all' | string;
}

/**
 * 旅行フィルターコンポーネントのプロパティ
 * 
 * @param filters - 現在のフィルター状態
 * @param onFilterChange - フィルター変更時のコールバック
 */
interface TravelFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

/**
 * 旅行フィルターコンポーネント
 * 旅行のステータスと目的地によるフィルタリング機能を提供
 */
const TravelFilters: React.FC<TravelFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  /**
   * ステータスフィルターオプションの定義
   */
  const statusOptions = [
    { value: 'all' as const, label: 'すべて' },
    { value: 'planning' as const, label: '計画中' },
    { value: 'confirmed' as const, label: '確定済み' },
    { value: 'completed' as const, label: '完了' }
  ];

  /**
   * 目的地フィルターオプションの定義
   */
  const destinationOptions = [
    { value: 'all', label: 'すべての目的地' },
    { value: '沖縄県', label: '沖縄県' },
    { value: '京都府', label: '京都府' },
    { value: '北海道', label: '北海道' },
    { value: '東京都', label: '東京都' }
  ];

  /**
   * ステータスフィルターを更新
   */
  const handleStatusChange = (status: Filters['status']) => {
    onFilterChange({ ...filters, status });
  };

  /**
   * 目的地フィルターを更新
   */
  const handleDestinationChange = (destination: string) => {
    onFilterChange({ ...filters, destination });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ステータスフィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ステータス
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${filters.status === option.value 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 目的地フィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            目的地
          </label>
          <select 
            value={filters.destination}
            onChange={(e) => handleDestinationChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            aria-label="目的地を選択"
          >
            {destinationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TravelFilters; 