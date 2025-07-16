import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { supabase } from './services/supabase';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import TravelCatalog from './components/travel/TravelCatalog';
import TravelCreator from './components/travel/TravelCreator';
import ScheduleTab from './components/travel/schedule';
import PlacesTab from './components/travel/places';
import AIRecommendationsTab from './components/travel/ai-recommendations';
import BudgetTab from './components/travel/budget';
import RoomAssignmentTab from './components/travel/room-assignment';
import PackingTab from './components/travel/packing';
import NotesTab from './components/travel/notes';
import EditTravelModal from './components/travel/TravelCatalog/EditTravelModal';
import { Travel } from './types/Travel';
import './index.css';
import TravelDetailHeader from './components/travel/TravelDetailHeader';
import { addNote } from './services/notesApi';
import { packingApi } from './services/packingApi';
import { travelApi } from './services/travelApi';
import { budgetApi } from './services/travelApi';

type AppView = 'catalog' | 'creator' | 'travel';

function calcDuration(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return '';
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return '0泊1日';
  } else {
    return `${diffDays}泊${diffDays + 1}日`;
  }
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('catalog');
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [places, setPlaces] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [placeDetailId, setPlaceDetailId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-xl">読み込み中...</div></div>;
  }

  if (!user) {
    return <Auth onAuthChange={setUser} />;
  }

  const handleSelectTravel = (travel: Travel) => {
    // 日付を文字列で取得（DBのカラム名を優先）
    let startDateStr = travel.start_date || travel.startDate || '';
    let endDateStr = travel.end_date || travel.endDate || '';
    // travel.datesが存在し、startDateまたはendDateが未設定の場合のみ分割
    if ((!startDateStr || !endDateStr) && travel.dates) {
      const dateParts = travel.dates.split(/〜|~|–|—|-/).map(s => s.trim());
      if (dateParts.length >= 2) {
        startDateStr = startDateStr || dateParts[0];
        endDateStr = endDateStr || dateParts[1];
      }
    }
    // idがなければ空文字
    const travelId = travel.id || '';
    const duration = calcDuration(startDateStr, endDateStr);
    setSelectedTravel({
      ...travel,
      id: travelId,
      startDate: startDateStr,
      endDate: endDateStr,
      duration,
      member_count: travel.member_count || travel.memberCount || 4,
      destination: travel.destination || '沖縄県那覇市',
    });
    setCurrentView('travel');
    setPlaces(travel.places || []);
  };

  const handleCreateNew = () => {
    setCurrentView('creator');
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setSelectedTravel(null);
  };

  const handleTravelCreated = async (travel) => {
    const startDateStr = travel.startDate
      ? travel.startDate.slice(0, 10)
      : (travel.dates ? travel.dates.split('〜')[0].trim() : '');
    const endDateStr = travel.endDate
      ? travel.endDate.slice(0, 10)
      : (travel.dates ? travel.dates.split('〜')[1]?.trim() : '');
    const duration = calcDuration(startDateStr, endDateStr);
    setSelectedTravel({
      ...travel,
      startDate: startDateStr,
      endDate: endDateStr,
      duration,
      destination: travel.destination || '未設定',
    });
    window.scrollTo(0, 0);
    setCurrentView('travel');

    // --- 旅行作成後に初期データを自分用に自動生成 ---
    if (user && travel.id) {
      // メモ
      await addNote({
        travel_id: travel.id,
        user_id: user.id,
        title: '最初のメモ',
        content: '',
        category: '旅行準備',
        is_pinned: false,
      });
      // 持ち物
      await packingApi.createPackingItem({
        travel_id: travel.id,
        user_id: user.id,
        name: 'パスポート',
        category: '必需品',
        quantity: 1,
        is_packed: false,
        is_essential: true,
      });
      // 予算
      await budgetApi.createBudget({
        travel_id: travel.id,
        user_id: user.id,
        amount: 0,
        breakdown: { category: '全体予算', title: '初期予算', type: 'initial' },
      });
    }
  };

  const handleAddToPlaces = (place: any) => {
    setPlaces(prev => [...prev, place]);
  };

  const handleNavigate = (tab: string, id?: string) => {
    setActiveTab(tab);
    if (tab === 'places' && id) {
      setPlaceDetailId(id);
    } else if (tab !== 'places') {
      setPlaceDetailId(null);
    }
  };

  const renderActiveTab = () => {
    // 旅行タイプを判定（簡易版：目的地に基づいて判定）
    const getTravelType = () => {
      if (!selectedTravel || !selectedTravel.destination) return 'domestic';
      // 海外の主要都市名で判定（簡易版）
      const internationalDestinations = [
        'パリ', 'ロンドン', 'ニューヨーク', 'ロサンゼルス', 'シンガポール', 'バンコク', 
        'ソウル', '台北', '香港', '上海', '北京', 'シドニー', 'メルボルン', 'バンクーバー',
        'トロント', 'バンクーバー', 'パリ', 'ローマ', 'ミラノ', 'バルセロナ', 'マドリード',
        'ベルリン', 'ミュンヘン', 'アムステルダム', 'ブリュッセル', 'ウィーン', 'プラハ',
        'ブダペスト', 'ワルシャワ', 'ストックホルム', 'コペンハーゲン', 'オスロ', 'ヘルシンキ'
      ];
      return internationalDestinations.some(dest => 
        selectedTravel.destination.includes(dest)
      ) ? 'international' : 'domestic';
    };

    switch (activeTab) {
      case 'schedule':
        return selectedTravel ? <ScheduleTab travelInfo={selectedTravel} onNavigate={handleNavigate} places={places} setPlaces={setPlaces} /> : null;
      case 'places':
        return <PlacesTab places={places} setPlaces={setPlaces} placeDetailId={placeDetailId} setPlaceDetailId={setPlaceDetailId} />;
      case 'ai-recommendations':
        return <AIRecommendationsTab 
          onAddToPlaces={handleAddToPlaces}
          recommendations={recommendations}
          setRecommendations={setRecommendations}
        />;
      case 'budget':
        return selectedTravel && typeof selectedTravel.id === 'string' ? <BudgetTab travelId={selectedTravel.id} userId={user.id} /> : null;
      case 'room-assignment':
        return selectedTravel && typeof selectedTravel.id === 'string' ? (
          <RoomAssignmentTab travelInfo={{
            startDate: typeof selectedTravel.startDate === 'string' ? selectedTravel.startDate : '',
            endDate: typeof selectedTravel.endDate === 'string' ? selectedTravel.endDate : '',
            destination: typeof selectedTravel.destination === 'string' ? selectedTravel.destination : '',
            memberCount: selectedTravel.member_count || selectedTravel.memberCount || 4,
            id: selectedTravel.id
          }} />
        ) : null;
      case 'packing':
         return selectedTravel && typeof selectedTravel.id === 'string' ? (
           <PackingTab
             travelId={selectedTravel.id}
             userId={user.id}
             packingData={('packingList' in selectedTravel) ? (selectedTravel as any).packingList : undefined}
             travelType={selectedTravel.travelType || 'domestic'}
           />
         ) : null;
      case 'notes':
        return selectedTravel && typeof selectedTravel.id === 'string' ? <NotesTab travelId={selectedTravel.id} userId={user.id} /> : null;
      default:
        return selectedTravel ? <ScheduleTab travelInfo={selectedTravel} /> : null;
    }
  };

  if (currentView === 'catalog') {
    return (
      <div className="min-h-screen bg-gray-50">
        <TravelCatalog 
          user={user}
          onSelectTravel={handleSelectTravel}
          onCreateNew={handleCreateNew}
        />
      </div>
    );
  }

  if (currentView === 'creator') {
    return (
      <TravelCreator 
        onBack={handleBackToCatalog}
        onComplete={handleTravelCreated}
        user={user}
      />
    );
  }

  if (currentView === 'travel' && selectedTravel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <TravelDetailHeader
          title={selectedTravel.title}
          startDate={selectedTravel.startDate || ''}
          endDate={selectedTravel.endDate || ''}
          destination={selectedTravel.destination}
          memberCount={selectedTravel.member_count || selectedTravel.memberCount}
          duration={selectedTravel.duration}
          onBack={handleBackToCatalog}
          userEmail={user.email}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <EditTravelModal
          isOpen={editModalOpen}
          travel={selectedTravel}
          onClose={() => setEditModalOpen(false)}
          onSave={(updated) => setSelectedTravel(updated)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveTab()}
        </main>
      </div>
    );
  }

  return null;
}

export default App;