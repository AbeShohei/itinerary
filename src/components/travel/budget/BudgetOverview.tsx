import React, { useState } from 'react';
import { CreditCard, TrendingUp, TrendingDown, Pencil } from 'lucide-react';
import Modal from '../../common/Modal';

/**
 * 予算概要コンポーネントのプロパティ
 * 
 * @param totalBudget - 総予算
 * @param totalExpenses - 総支出
 * @param remainingBudget - 残り予算
 * @param expenses - 支出リスト
 * @param categoryBudgets - カテゴリ別予算リスト
 */
interface Expense {
  id: string;
  date: string;
  category: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

interface CategoryBudget {
  category: string;
  amount: number;
}

interface BudgetOverviewProps {
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  expenses: Expense[];
  categoryBudgets: CategoryBudget[];
  travelId: string;
  onBudgetUpdate: (newBudget: number) => void;
}

/**
 * 予算概要コンポーネント
 * 予算、支出、残り予算の概要を表示
 */
const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  totalBudget,
  totalExpenses,
  remainingBudget,
  expenses = [],
  categoryBudgets = [],
  travelId,
  onBudgetUpdate,
}) => {
  // カテゴリごとの実支出額を集計
  const actuals: Record<string, number> = {};
  expenses.forEach(e => {
    if (e.type === 'expense') {
      actuals[e.category] = (actuals[e.category] || 0) + e.amount;
    }
  });

  // 総支出（type: 'expense'のみ合計）はpropsのtotalExpensesを使う
  // const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0); // ←削除

  // 支出率（分母は必ずtotalBudget）
  const expenseRate = totalBudget > 0 ? totalExpenses / totalBudget : 0;

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editValue, setEditValue] = useState(totalBudget);

  const handleEditClick = () => {
    setEditValue(totalBudget);
    setEditModalOpen(true);
  };
  const handleEditSave = async () => {
    try {
      const { travelApi, budgetApi } = await import('../../../services/travelApi');
      await travelApi.updateTravel(travelId, { budget: editValue });
      // budgetテーブルの自分のamountも同期
      const budgets = await budgetApi.getBudgets(travelId, userId);
      if (budgets.length > 0) {
        await budgetApi.updateBudget(budgets[0].id, { amount: editValue });
      } else {
        // もし自分のbudgetレコードがなければ新規作成
        await budgetApi.createBudget({
          travel_id: travelId,
          user_id: userId,
          amount: editValue,
          breakdown: { category: '全体予算', title: '初期予算', type: 'initial' }
        });
      }
      const updated = await travelApi.getTravel(travelId);
      onBudgetUpdate(updated.budget);
      setEditModalOpen(false);
    } catch (e) {
      alert('予算の保存に失敗しました');
    }
  };

  return (
    <>
      {/* 全体予算・支出バー */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">全体の予算と支出</h3>
          <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="編集" onClick={handleEditClick}>
            <Pencil className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          {/* 総予算バー */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">総支出</span>
              <span className={`text-sm font-mono ${totalExpenses > totalBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>¥{totalExpenses.toLocaleString()} / ¥{totalBudget.toLocaleString()}</span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden relative">
              {/* 予算内 or 超過時のバー */}
              {totalExpenses > totalBudget ? (
                <div
                  className="h-4 rounded-full transition-all duration-300 bg-red-500"
                  style={{ width: `${80 + Math.min(((totalExpenses - totalBudget) / totalBudget) * 80, 20)}%` }}
                />
              ) : (
                <div
                  className="h-4 rounded-full transition-all duration-300 bg-blue-500"
                  style={{ width: `${Math.min((totalExpenses / totalBudget), 1) * 80}%` }}
                />
              )}
              {/* 予算の線（80%地点、バーの上に重ねて目立つ色） */}
              <div
                className="absolute top-0 bottom-0 w-1 h-full bg-yellow-500 -z-10 rounded"
                style={{ left: 'calc(80% - 2px)' }}
              />
            </div>
            {totalExpenses > totalBudget && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">予算超過：+¥{(totalExpenses - totalBudget).toLocaleString()}</div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 予算 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">予算</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                ¥{totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        {/* 支出 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">支出</p>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                ¥{totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full dark:bg-red-900">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        
        {/* 残り */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">残り</p>
              <p className={`text-2xl font-semibold ${remainingBudget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ¥{remainingBudget.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${remainingBudget >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <TrendingUp className={`h-6 w-6 ${remainingBudget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリ別予算バー */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">カテゴリ別予算</h3>
        <div className="space-y-4">
          {categoryBudgets.map(({ category, amount }) => {
            const actual = actuals[category] || 0;
            const percent = amount > 0 ? Math.min((actual / amount), 1) * 100 : 0;
            const isOver = actual > amount;
            const isWarning = !isOver && percent >= 80;
            const overPercent = isOver && amount > 0 ? Math.min(((actual - amount) / amount) * 100, 100) : 0;
            let barColor = 'bg-blue-500';
            if (isWarning) barColor = 'bg-yellow-400';
            if (isOver) barColor = 'bg-red-500';
            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
                  <span className={`text-sm font-mono ${isOver ? 'text-red-600 dark:text-red-400' : isWarning ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300'}`}>¥{actual.toLocaleString()} / ¥{amount.toLocaleString()}</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden relative">
                  {/* 80%地点の線（先に描画） */}
                    <div
                    className="absolute top-0 left-0 h-full"
                    style={{
                      left: 'calc(80% - 1px)',
                      width: '2px',
                      background: '#facc15', // Tailwind yellow-400
                      height: '100%',
                      zIndex: 0
                    }}
                    />
                  {/* 進捗バー（後に描画） */}
                    <div
                    className={`h-4 rounded-full transition-all duration-300 ${barColor} relative`}
                    style={{ width: `${isOver ? 100 + overPercent : percent}%`, zIndex: 1 }}
                  />
                </div>
                {isOver && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">予算超過：+¥{(actual - amount).toLocaleString()}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 予算編集モーダル */}
      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="予算を編集">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">新しい予算金額</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-lg"
            value={editValue}
            min={0}
            onChange={e => setEditValue(Number(e.target.value))}
            placeholder="例: 50000"
          />
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            onClick={handleEditSave}
          >保存</button>
        </div>
      </Modal>
    </>
  );
};

export default BudgetOverview; 