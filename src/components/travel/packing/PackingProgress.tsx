import React from 'react';
import { Package } from 'lucide-react';

/**
 * パッキング進捗コンポーネントのプロパティ
 * 
 * @param packedCount - パッキング済みアイテム数
 * @param totalCount - 総アイテム数
 * @param essentialUnpacked - 未パッキングの必須アイテム数
 * @param essentialUnpackedList - 未パッキングの必須アイテムリスト
 */
interface PackingProgressProps {
  packedCount: number;
  totalCount: number;
  essentialUnpacked: number;
  essentialUnpackedList?: { id: string; name: string }[];
}

/**
 * パッキング進捗コンポーネント
 * パッキングの進捗状況を表示
 */
const PackingProgress: React.FC<PackingProgressProps> = ({
  packedCount,
  totalCount,
  essentialUnpacked,
  essentialUnpackedList = []
}) => {
  const progressPercentage = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">パッキング進捗</h3>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">
            {packedCount} / {totalCount} アイテム
          </span>
        </div>
      </div>
      
      {/* プログレスバー */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>{Math.round(progressPercentage)}% 完了</span>
          <span>{totalCount - packedCount} アイテム残り</span>
        </div>
      </div>
      
      {/* 必須アイテム警告 */}
      {essentialUnpacked > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-sm font-medium text-yellow-800">
              必須アイテム {essentialUnpacked} 個がまだパッキングされていません
            </span>
          </div>
          {essentialUnpackedList.length > 0 && (
            <ul className="list-disc list-inside text-yellow-900 text-sm ml-5">
              {essentialUnpackedList.map(item => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* 完了メッセージ */}
      {packedCount === totalCount && totalCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-green-800">
              パッキング完了！準備万端です
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackingProgress; 