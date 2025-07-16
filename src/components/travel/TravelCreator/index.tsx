import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TravelForm from './TravelForm';
import AIGenerationStep from './AIGenerationStep';
import PlanReviewStep from './PlanReviewStep';
import Button from '../../common/Button';
import { TravelFormData, Travel } from '../../../types/Travel';
import { travelApi } from '../../../services/travelApi';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import { generateTravelTemplates, generateDummyPlaces, generateDummyRooms } from '../../../utils/travelTemplates';

/**
 * 旅行作成のステップ
 */
type CreatorStep = 'form' | 'selection' | 'ai-generation' | 'review';

/**
 * 旅行作成コンポーネントのプロパティ
 * 
 * @param onBack - 戻るボタンクリック時のコールバック
 * @param onComplete - 旅行作成完了時のコールバック
 */
interface TravelCreatorProps {
  onBack: () => void;
  onComplete: (travel: any) => void;
  user: { id: string };
}

/**
 * 旅行作成コンポーネント
 * 旅行の基本情報入力からAIプラン生成、確認までの一連の流れを管理
 */
const TravelCreator: React.FC<TravelCreatorProps> = ({ onBack, onComplete, user }) => {
  // 現在のステップ
  const [step, setStep] = useState<CreatorStep>('form');
  
  // エラー状態
  const [error, setError] = useState<string | null>(null);
  
  // フォームデータ
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const [formData, setFormData] = useState<TravelFormData>({
    title: '',
    destination: '',
    departure: '',
    arrival: '', // arrivalはdepartureと同じ値で初期化するため、departureの値を後で同期
    startDate: formatDate(today),   // 今日で初期化
    endDate: formatDate(tomorrow),  // 明日で初期化
    memberCount: 2,
    budget: 50000,
    interests: [],
    travelStyle: 'balanced',
    travelType: 'domestic',
    description: '',
    transportation: '',
    theme: ''
  });

  // 生成されたプラン
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  /**
   * フォーム完了時の処理（AI生成）
   */
  const handleFormComplete = () => {
    // 必須項目チェック
    if (
      !formData.departure ||
      !formData.arrival ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.memberCount ||
      !formData.budget
    ) {
      alert("必須項目をすべて入力してください");
      return;
    }
    setError(null);
    setStep('ai-generation');
  };

  /**
   * 手動作成の処理
   */
  const handleManualCreation = () => {
    // 必須項目チェック
    if (
      !formData.departure ||
      !formData.arrival ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.memberCount ||
      !formData.budget
    ) {
      alert("必須項目をすべて入力してください");
      return;
    }
    setError(null);
    createManually();
  };

  /**
   * AIによるプラン生成を開始
   */
  const generateWithAI = async () => {
    setError(null);
    setStep('ai-generation');
  };

  /**
   * 手動でプランを作成
   */
  const createManually = async () => {
    try {
      setError(null);
      
      // ダミーデータを生成
      const dummyRooms = generateDummyRooms(formData.memberCount);
      
      // テンプレートを生成
      const templates = generateTravelTemplates(
        formData.memberCount,
        formData.startDate,
        formData.endDate,
        formData.budget,
        formData.travelType
      );
      // カテゴリ別予算を配列形式に変換（0円でも必ず配列で渡す）
      const breakdownObj = templates.budgetBreakdown || {};
      const breakdownArr = [
        { category: '交通費', amount: breakdownObj.transportation || 0 },
        { category: '宿泊費', amount: breakdownObj.accommodation || 0 },
        { category: '食費', amount: breakdownObj.food || 0 },
        { category: '観光費', amount: breakdownObj.activities || 0 }
      ];
      
      // 期間を計算
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const nights = days - 1;
      const duration = `${nights}泊${days}日`;
      const dates = `${formData.startDate} 〜 ${formData.endDate}`;
      
      const travelData = {
        title: formData.title || `${formData.destination}旅行`,
        destination: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        duration: duration,
        dates: dates,
        member_count: formData.memberCount,
        budget: formData.budget, // ←必ずセット
        interests: formData.interests,
        travel_style: formData.travelStyle,
        description: formData.description,
        status: 'planning' as const,
        schedule: templates.schedule,
        places: [], // 観光スポットは空
        budget_breakdown: [], // 予算内訳も空
        roomAssignments: [], // 部屋割りも空
        packingList: [], // 持ち物も空
        travelType: formData.travelType,
        user_id: user.id, // ←追加
      };

      const createdTravel = await travelApi.createTravel(travelData);
      onComplete(createdTravel);
    } catch (err) {
      console.error('旅行作成エラー:', err);
      setError('旅行の作成に失敗しました。もう一度お試しください。');
    }
  };

  /**
   * AIプラン生成完了時の処理
   */
  const handlePlanGenerated = (plan: any) => {
    setGeneratedPlan(plan);
    setStep('review');
  };

  /**
   * AIプラン生成エラー時の処理
   */
  const handlePlanError = (errorMessage: string) => {
    setError(errorMessage);
    // setStep('selection'); ← これを削除
  };

  /**
   * 旅行を作成
   */
  const createTravel = async () => {
    try {
      setError(null);
      
      // 期間を計算
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const nights = days - 1;
      const duration = `${nights}泊${days}日`;
      const dates = `${formData.startDate} 〜 ${formData.endDate}`;
      
      // AI生成時も同様に配列形式でセット
      const breakdownObj2 = generatedPlan?.budget || {
        transportation: Math.round(formData.budget * 0.3),
        accommodation: Math.round(formData.budget * 0.4),
        food: Math.round(formData.budget * 0.2),
        activities: Math.round(formData.budget * 0.1)
      };
      const breakdownArr2 = [
        { category: '交通費', amount: breakdownObj2.transportation || 0 },
        { category: '宿泊費', amount: breakdownObj2.accommodation || 0 },
        { category: '食費', amount: breakdownObj2.food || 0 },
        { category: '観光費', amount: breakdownObj2.activities || 0 }
      ];
      const travelData2 = {
        title: generatedPlan?.title || formData.title || `${formData.destination}旅行`,
        destination: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        duration: duration,
        dates: dates,
        member_count: formData.memberCount,
        budget: formData.budget, // ←必ずセット
        interests: formData.interests,
        travel_style: formData.travelStyle,
        description: formData.description,
        status: 'planning' as const,
        schedule: generatedPlan?.schedule || [],
        places: generatedPlan?.places || [],
        budget_breakdown: breakdownArr2, // ←必ずセット
        travelType: formData.travelType,
        user_id: user.id, // ←追加
      };

      const createdTravel = await travelApi.createTravel(travelData2);
      onComplete(createdTravel);
    } catch (err) {
      console.error('旅行作成エラー:', err);
      setError('旅行の作成に失敗しました。もう一度お試しください。');
    }
  };

  /**
   * 旅行期間を計算
   */
  const calculateDuration = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const nights = days - 1;
    return `${nights}泊${days}日`;
  };

  /**
   * 目的地に応じた画像を取得
   */
  const getDestinationImage = (destination: string) => {
    const images: Record<string, string> = {
      '沖縄': 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=600',
      '京都': 'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=600',
      '北海道': 'https://images.pexels.com/photos/358457/pexels-photo-358457.jpeg?auto=compress&cs=tinysrgb&w=600',
      '東京': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600'
    };
    return images[destination] || 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=600';
  };

  // AI生成ステップの表示
  if (step === 'ai-generation') {
    console.log("AIGenerationStep mounted");
    return (
      <AIGenerationStep
        travelData={{
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          memberCount: formData.memberCount,
          budget: formData.budget,
          interests: formData.interests,
          travelStyle: formData.travelStyle,
          travelType: formData.travelType,
          description: formData.description
        }}
        onPlanGenerated={handlePlanGenerated}
        onError={handlePlanError}
        onManualCreate={createManually} // 追加
      />
    );
  }

  // プラン確認ステップの表示
  if (step === 'review') {
    return (
      <PlanReviewStep
        formData={formData}
        generatedPlan={generatedPlan}
        onCreateTravel={createTravel}
        onBack={() => setStep('selection')}
        error={error}
      />
    );
  }

  // 選択ステップの表示
  if (step === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setStep('form')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">プラン作成方法を選択</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 旅行概要 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center gap-4">
              <img
                src={getDestinationImage(formData.destination)}
                alt={formData.destination}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formData.title || `${formData.destination}旅行`}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.startDate} 〜 {formData.endDate} ({calculateDuration()})
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.memberCount}名 • ¥{formData.budget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* 選択オプション */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* AIプラン生成 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={generateWithAI}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <AutoAwesomeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AIでプラン生成</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                AIがあなたの好みに合わせて最適な旅行プランを自動生成します。
                観光スポット、スケジュール、予算配分まで提案します。
              </p>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                推奨：初めての旅行や効率的なプラン作成に
              </div>
            </div>

            {/* 手動作成 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={createManually}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <EditIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">手動で作成</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                自分で旅行プランを一から作成します。
                細かい調整やオリジナルのプランを作りたい方におすすめです。
              </p>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                推奨：カスタマイズ重視や既にプランがある方に
              </div>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900 dark:border-red-700">
              <p className="text-red-800 dark:text-red-100">{error}</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // フォームステップの表示
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">新しい旅行を作成</h1>
          </div>
        </div>
      </header>

      {/* フォーム */}
      <TravelForm
        formData={formData}
        onFormDataChange={setFormData}
        onNext={handleFormComplete}
        onManualCreate={handleManualCreation}
      />
    </div>
  );
};

export default TravelCreator; 