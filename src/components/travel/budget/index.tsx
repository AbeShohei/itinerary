import React, { useState, useEffect } from 'react';
import { Plus, Settings, Edit, Save, X } from 'lucide-react';
import BudgetOverview from './BudgetOverview';
import ExpenseItem from './ExpenseItem';
import ExpenseForm from './ExpenseForm';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { budgetApi, travelApi } from '../../../services/travelApi';

/**
 * 支出項目の型定義
 */
interface Expense {
  id: string;
  date: string;
  category: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

/**
 * 予算データの型定義
 */
interface BudgetData {
  transportation: number;
  accommodation: number;
  food: number;
  activities: number;
}

/**
 * カテゴリ別予算の型定義
 */
interface CategoryBudget {
  category: string;
  amount: number;
  isEditing: boolean;
}

/**
 * 予算タブコンポーネントのプロパティ
 */
interface BudgetTabProps {
  travelId?: string;
  userId: string;
  budgetData?: BudgetData;
}

/**
 * 予算タブコンポーネント
 * 予算管理、支出の追加・編集・削除機能を提供
 */
const BudgetTab: React.FC<BudgetTabProps> = ({ travelId, userId }) => {
  // 支出データの状態
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // カテゴリ別予算の状態
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);

  // カテゴリの状態
  const [categories, setCategories] = useState<string[]>([
    '交通費', '宿泊費', '食費', '観光費', 'その他'
  ]);

  // 合計予算（travelテーブルのbudget）
  const [travelBudget, setTravelBudget] = useState<number>(0);

  // モーダルの状態
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newCategory, setNewCategory] = useState('');

  // 編集用の一時stateを追加
  const [editAmounts, setEditAmounts] = useState<{ [category: string]: string }>({});

  // 予算編集用state
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editBudgetValue, setEditBudgetValue] = useState('');

  // 編集開始時に一時stateに初期値をセット
  const startEditBudget = (category: string) => {
    setCategoryBudgets(prev => prev.map(budget =>
      budget.category === category ? { ...budget, isEditing: true } : budget
    ));
    setEditAmounts(prev => ({
      ...prev,
      [category]: categoryBudgets.find(b => b.category === category)?.amount.toString() || ''
    }));
  };

  // 旅行情報の取得
  useEffect(() => {
    if (travelId) {
      travelApi.getTravel(travelId).then((travel) => {
        setTravelBudget(travel.budget || 0);
        let breakdownArr = [];
        if (Array.isArray(travel.budget_breakdown)) {
          breakdownArr = travel.budget_breakdown.map((b) => {
            const editing = categoryBudgets.find(cb => cb.category === b.category)?.isEditing || false;
            return { ...b, isEditing: editing };
          });
        } else if (typeof travel.budget_breakdown === 'object' && travel.budget_breakdown !== null) {
          breakdownArr = [
            { category: '交通費', amount: travel.budget_breakdown.transportation || 0, isEditing: categoryBudgets.find(cb => cb.category === '交通費')?.isEditing || false },
            { category: '宿泊費', amount: travel.budget_breakdown.accommodation || 0, isEditing: categoryBudgets.find(cb => cb.category === '宿泊費')?.isEditing || false },
            { category: '食費', amount: travel.budget_breakdown.food || 0, isEditing: categoryBudgets.find(cb => cb.category === '食費')?.isEditing || false },
            { category: '観光費', amount: travel.budget_breakdown.activities || 0, isEditing: categoryBudgets.find(cb => cb.category === '観光費')?.isEditing || false }
          ];
        }
        // すべてのカテゴリのamountが0または未設定なら、自動分配
        const allZero = breakdownArr.length > 0 && breakdownArr.every(b => !b.amount || b.amount === 0);
        if (allZero && travel.budget) {
          const total = travel.budget;
          breakdownArr = [
            { category: '交通費', amount: Math.round(total * 0.3), isEditing: false },
            { category: '宿泊費', amount: Math.round(total * 0.4), isEditing: false },
            { category: '食費', amount: Math.round(total * 0.2), isEditing: false },
            { category: '観光費', amount: Math.round(total * 0.1), isEditing: false }
          ];
          // Supabaseにも保存
          travelApi.updateTravel(travelId, {
            budget_breakdown: breakdownArr.map(({ isEditing, ...rest }) => rest)
          });
        }
        setCategoryBudgets(breakdownArr);
      });
    }
  }, [travelId]);

  // 支出履歴をSupabaseから取得
  useEffect(() => {
    if (!travelId || !userId) return;
    (async () => {
      let budgets = await budgetApi.getBudgets(travelId, userId);
      if (budgets.length === 0) {
        await budgetApi.createBudget({
          travel_id: travelId,
          user_id: userId,
          amount: 0,
          breakdown: { category: '全体予算', title: '初期予算', type: 'initial' }
        });
        budgets = await budgetApi.getBudgets(travelId, userId);
      }
      setTravelBudget(budgets[0]?.amount || 0);
      // 必要に応じてsetExpensesも更新
    })();
  }, [travelId, userId]);

  // 予算計算
  const totalBudget = travelBudget;
  const totalExpenses = expenses.reduce((sum, expense) => 
    expense.type === 'expense' ? sum + expense.amount : sum - expense.amount, 0
  );
  const remainingBudget = totalBudget - totalExpenses;

  // カテゴリ別集計
  const categoryTotals = expenses.reduce((acc, expense) => {
    const amount = expense.type === 'expense' ? expense.amount : -expense.amount;
    acc[expense.category] = (acc[expense.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  /**
   * カテゴリ予算の保存
   */
  const saveBudget = async (category: string, amount: number) => {
    const newBudgets = categoryBudgets.map(budget =>
      budget.category === category ? { ...budget, amount, isEditing: false } : budget
    );
    setCategoryBudgets(newBudgets);
    if (travelId) {
      await travelApi.updateTravel(travelId, { budget_breakdown: newBudgets.map(({ isEditing, ...rest }) => rest) });
      // 保存後に再取得して最新化
      const travel = await travelApi.getTravel(travelId);
      if (travel.budget_breakdown && Array.isArray(travel.budget_breakdown)) {
        setCategoryBudgets(travel.budget_breakdown.map((b: any) => ({ ...b, isEditing: false })));
      }
    }
  };

  /**
   * カテゴリ予算の編集キャンセル
   */
  const cancelEditBudget = (category: string) => {
    setCategoryBudgets(prev => prev.map(budget => 
      budget.category === category ? { ...budget, isEditing: false } : budget
    ));
    setEditAmounts(prev => ({ ...prev, [category]: undefined }));
  };

  /**
   * 予算保存処理
   */
  const saveBudgetTotal = async () => {
    if (travelId && editBudgetValue) {
      const newBudget = parseInt(editBudgetValue, 10) || 0;
      await travelApi.updateTravel(travelId, { budget: newBudget });
      setTravelBudget(newBudget);
      setIsEditingBudget(false);
    }
  };

  /**
   * 支出追加
   */
  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  /**
   * 支出編集
   */
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowEditExpenseModal(true);
  };

  /**
   * 支出削除
   */
  const deleteExpense = async (id: string) => {
    if (travelId) {
      await budgetApi.deleteBudget(id);
      // 再取得
      const budgets = await budgetApi.getBudgets(travelId, userId);
      const loadedExpenses = budgets.map(b => ({
        id: b.id,
        date: b.created_at || '',
        category: b.breakdown?.category || 'その他',
        title: b.breakdown?.title || '',
        amount: b.amount,
        type: b.breakdown?.type || 'expense',
      }));
      setExpenses(loadedExpenses);
    } else {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  /**
   * 新しい支出を保存
   */
  const saveNewExpense = async (expense: Expense) => {
    if (travelId) {
      await budgetApi.createBudget({
        travel_id: travelId,
        amount: expense.amount,
        breakdown: {
          category: expense.category,
          title: expense.title,
          type: expense.type
        }
      });
      // 再取得
      const budgets = await budgetApi.getBudgets(travelId, userId);
      const loadedExpenses = budgets.map(b => ({
        id: b.id,
        date: b.created_at || '',
        category: b.breakdown?.category || 'その他',
        title: b.breakdown?.title || '',
        amount: b.amount,
        type: b.breakdown?.type || 'expense',
      }));
      setExpenses(loadedExpenses);
    } else {
      setExpenses([...expenses, expense]);
    }
    setShowAddExpenseModal(false);
  };

  /**
   * 編集した支出を保存
   */
  const saveEditedExpense = async (expense: Expense) => {
    if (travelId && expense.id) {
      await budgetApi.updateBudget(expense.id, {
        amount: expense.amount,
        breakdown: {
          category: expense.category,
          title: expense.title,
          type: expense.type
        }
      });
      // 再取得
      const budgets = await budgetApi.getBudgets(travelId, userId);
      const loadedExpenses = budgets.map(b => ({
        id: b.id,
        date: b.created_at || '',
        category: b.breakdown?.category || 'その他',
        title: b.breakdown?.title || '',
        amount: b.amount,
        type: b.breakdown?.type || 'expense',
      }));
      setExpenses(loadedExpenses);
    } else {
      setExpenses(expenses.map(e => e.id === expense.id ? expense : e));
    }
    setShowEditExpenseModal(false);
    setEditingExpense(null);
  };

  /**
   * カテゴリ追加
   */
  const addCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);

      // categoryBudgetsにも追加
      const newBudget = { category: newCategory.trim(), amount: 0, isEditing: false };
      const updatedBudgets = [...categoryBudgets, newBudget];
      setCategoryBudgets(updatedBudgets);

      // Supabaseにも保存
      if (travelId) {
        await travelApi.updateTravel(travelId, {
          budget_breakdown: updatedBudgets.map(({ isEditing, ...rest }) => rest)
        });
        // 保存後に再取得して最新化
        const travel = await travelApi.getTravel(travelId);
        let breakdownArr = [];
        if (Array.isArray(travel.budget_breakdown)) {
          breakdownArr = travel.budget_breakdown.map((b) => {
            const editing = categoryBudgets.find(cb => cb.category === b.category)?.isEditing || false;
            return { ...b, isEditing: editing };
          });
        } else if (typeof travel.budget_breakdown === 'object' && travel.budget_breakdown !== null) {
          breakdownArr = [
            { category: '交通費', amount: travel.budget_breakdown.transportation || 0, isEditing: categoryBudgets.find(cb => cb.category === '交通費')?.isEditing || false },
            { category: '宿泊費', amount: travel.budget_breakdown.accommodation || 0, isEditing: categoryBudgets.find(cb => cb.category === '宿泊費')?.isEditing || false },
            { category: '食費', amount: travel.budget_breakdown.food || 0, isEditing: categoryBudgets.find(cb => cb.category === '食費')?.isEditing || false },
            { category: '観光費', amount: travel.budget_breakdown.activities || 0, isEditing: categoryBudgets.find(cb => cb.category === '観光費')?.isEditing || false }
          ];
        }
        setCategoryBudgets(breakdownArr);
      }

      setNewCategory('');
      setShowAddCategoryModal(false);
    }
  };

  /**
   * カテゴリ削除
   */
  const deleteCategory = (category: string) => {
    if (category !== 'その他') {
      setCategories(categories.filter(cat => cat !== category));
      // このカテゴリの支出を「その他」に変更
      setExpenses(expenses.map(expense => 
        expense.category === category ? { ...expense, category: 'その他' } : expense
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* 予算概要 */}
      <BudgetOverview
        totalBudget={totalBudget}
        totalExpenses={totalExpenses}
        remainingBudget={remainingBudget}
        expenses={expenses}
        categoryBudgets={categoryBudgets}
        travelId={travelId || ''}
        onBudgetUpdate={(newBudget) => setTravelBudget(newBudget)}
      />

      {/* カテゴリ別予算 */}
      {travelId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ別予算</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryBudgets.map((budget) => (
              <div key={budget.category} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{budget.category}</p>
                  {budget.isEditing ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const newAmount = parseInt(editAmounts[budget.category], 10) || 0;
                          saveBudget(budget.category, newAmount);
                          setEditAmounts(prev => ({ ...prev, [budget.category]: undefined }));
                        }}
                        className="text-green-600 hover:text-green-800"
                        aria-label="保存"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => cancelEditBudget(budget.category)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="キャンセル"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditBudget(budget.category)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="編集"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {budget.isEditing ? (
                  <Input
                    type="number"
                    value={editAmounts[budget.category] ?? ''}
                    onChange={(value) => {
                      setEditAmounts(prev => ({
                        ...prev,
                        [budget.category]: value
                      }));
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full"
                    placeholder="予算を入力"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    ¥{budget.amount.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() => setShowAddCategoryModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>カテゴリを追加</span>
            </Button>
          </div>
        </div>
      )}

      {/* カテゴリ別集計 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">カテゴリ別集計</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(category => {
            const total = categoryTotals[category] || 0;
            return (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">{category}</p>
                <p className={`font-semibold ${total >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  ¥{Math.abs(total).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">支出履歴</h2>
        <div className="flex gap-2">
          {/* スマホ：丸アイコンボタン */}
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="flex items-center justify-center bg-gray-200 text-gray-700 rounded-full w-10 h-10 shadow-md hover:bg-gray-300 transition-colors md:hidden"
            aria-label="カテゴリ管理"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={handleAddExpense}
            className="flex items-center justify-center bg-blue-600 text-white rounded-full w-10 h-10 shadow-md hover:bg-blue-700 transition-colors md:hidden"
            aria-label="支出を追加"
          >
            <Plus className="h-5 w-5" />
          </button>
          {/* PC：従来のボタン */}
          <Button
            variant="secondary"
            onClick={() => setShowAddCategoryModal(true)}
            className="hidden md:flex items-center"
          >
            <Settings className="h-4 w-4 mr-2 md:mr-2" />
            <span className="hidden md:inline">カテゴリ管理</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleAddExpense}
            className="hidden md:flex items-center"
          >
            <Plus className="h-4 w-4 mr-2 md:mr-2" />
            <span className="hidden md:inline">支出を追加</span>
          </Button>
        </div>
      </div>

      {/* 支出リスト */}
      <div className="space-y-3">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={handleEditExpense}
              onDelete={deleteExpense}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <p className="text-gray-500 text-lg dark:text-gray-400">支出がありません</p>
            <p className="text-sm text-gray-400 mt-1 dark:text-gray-500">「支出を追加」ボタンから支出を追加してください</p>
          </div>
        )}
      </div>

      {/* 支出追加モーダル */}
      <Modal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        title="新しい支出を追加"
        size="lg"
      >
        <ExpenseForm
          expense={null}
          categories={categories}
          onSave={saveNewExpense}
          onCancel={() => setShowAddExpenseModal(false)}
        />
      </Modal>

      {/* 支出編集モーダル */}
      <Modal
        isOpen={showEditExpenseModal}
        onClose={() => {
          setShowEditExpenseModal(false);
          setEditingExpense(null);
        }}
        title="支出を編集"
        size="lg"
      >
        <ExpenseForm
          expense={editingExpense}
          categories={categories}
          onSave={saveEditedExpense}
          onCancel={() => {
            setShowEditExpenseModal(false);
            setEditingExpense(null);
          }}
        />
      </Modal>

      {/* カテゴリ追加モーダル */}
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
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">新しいカテゴリを追加</h4>
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
    </div>
  );
};

export default BudgetTab; 