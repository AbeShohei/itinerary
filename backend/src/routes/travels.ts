import express, { Request, Response } from 'express';
import Travel, { ITravel } from '../models/Travel';
import mongoose from 'mongoose';

const router = express.Router();

// インメモリデータストレージ（MongoDBが利用できない場合のフォールバック）
let inMemoryTravels: any[] = [];
let nextId = 1;

/**
 * 日付のバリデーション
 */
const validateTravelDates = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 開始日が今日より前の場合
  if (start < today) {
    return { 
      isValid: false, 
      message: '開始日は今日以降の日付を選択してください' 
    };
  }

  // 終了日が開始日より前の場合
  if (end < start) {
    return { 
      isValid: false, 
      message: '終了日は開始日以降の日付を選択してください' 
    };
  }

  // 旅行期間が長すぎる場合（例：1年以上）
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 365) {
    return { 
      isValid: false, 
      message: '旅行期間は1年以内にしてください' 
    };
  }

  return { isValid: true, message: '' };
};

// 全ての旅行を取得
router.get('/', async (req: Request, res: Response) => {
  try {
    // MongoDBが利用可能な場合はMongoDBから取得
    if (mongoose.connection.readyState === 1) {
      const travels = await Travel.find().sort({ createdAt: -1 });
      return res.json(travels);
    }
    
    // MongoDBが利用できない場合はインメモリから取得
    res.json(inMemoryTravels);
  } catch (error) {
    console.error('旅行データ取得エラー:', error);
    res.status(500).json({ message: '旅行データの取得に失敗しました' });
  }
});

// 特定の旅行を取得
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const travel = await Travel.findById(req.params.id);
      if (!travel) {
        return res.status(404).json({ message: '旅行が見つかりません' });
      }
      return res.json(travel);
    }
    
    // インメモリから取得
    const travel = inMemoryTravels.find(t => t.id === req.params.id);
    if (!travel) {
      return res.status(404).json({ message: '旅行が見つかりません' });
    }
    res.json(travel);
  } catch (error) {
    res.status(500).json({ message: '旅行データの取得に失敗しました' });
  }
});

// AIプラン生成
router.post('/generate-plan', async (req: Request, res: Response) => {
  try {
    const {
      destination,
      departure,
      arrival,
      startDate,
      endDate,
      memberCount,
      budget,
      interests,
      travelStyle,
      description,
      aiSuggestDestination
    } = req.body;

    // バリデーション
    if (!destination || !startDate || !endDate || !memberCount || !budget) {
      return res.status(400).json({ 
        message: '必須項目が不足しています' 
      });
    }

    const dateValidation = validateTravelDates(startDate, endDate);
    if (!dateValidation.isValid) {
      return res.status(400).json({ 
        message: dateValidation.message 
      });
    }

    // AIプラン生成（動的インポート）
    const { generateTravelPlan } = await import('../services/aiService');
    const result = await generateTravelPlan({
      destination,
      departure,
      arrival,
      startDate,
      endDate,
      memberCount,
      budget,
      interests: interests || [],
      travelStyle: travelStyle || 'balanced',
      description: description || '',
      aiSuggestDestination: !!aiSuggestDestination
    });

    if (result.success) {
      res.json({
        success: true,
        plan: result.data
      });
    } else {
      res.json({
        success: false,
        plan: result.data,
        message: 'AIプラン生成に失敗しましたが、基本的なプランを提供します',
        error: result.error
      });
    }
  } catch (error) {
    console.error('AIプラン生成エラー:', error);
    res.status(500).json({ 
      message: 'AIプラン生成に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    });
  }
});

// 新しい旅行を作成
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      destination,
      startDate,
      endDate,
      memberCount,
      budget,
      interests,
      travelStyle,
      description,
      schedule,
      places,
      budgetBreakdown
    } = req.body;

    // 日付のバリデーション
    const dateValidation = validateTravelDates(startDate, endDate);
    if (!dateValidation.isValid) {
      return res.status(400).json({ 
        message: dateValidation.message 
      });
    }

    // その他のバリデーション
    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({ 
        message: '必須項目が不足しています' 
      });
    }

    if (memberCount < 1) {
      return res.status(400).json({ 
        message: '参加人数は1名以上で入力してください' 
      });
    }

    if (budget < 0) {
      return res.status(400).json({ 
        message: '予算は0円以上で入力してください' 
      });
    }

    // 旅行期間を計算
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const nights = days - 1;
    const duration = `${nights}泊${days}日`;
    const dates = `${startDate} - ${endDate}`;

    // 目的地に応じた画像を取得
    const getDestinationImage = (destination: string) => {
      const images: { [key: string]: string } = {
        '沖縄': 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=600',
        '京都': 'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=600',
        '北海道': 'https://images.pexels.com/photos/358457/pexels-photo-358457.jpeg?auto=compress&cs=tinysrgb&w=600',
        '東京': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600'
      };
      return images[destination] || 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=600';
    };

    const travelData = {
      title,
      destination,
      duration,
      dates,
      description: description || '',
      image: getDestinationImage(destination),
      status: 'planning' as const,
      memberCount,
      budget,
      interests: interests || [],
      travelStyle: travelStyle || 'balanced',
      schedule: schedule || [],
      places: places || [],
      budgetBreakdown: budgetBreakdown || {
        transportation: Math.round(budget * 0.3),
        accommodation: Math.round(budget * 0.4),
        food: Math.round(budget * 0.2),
        activities: Math.round(budget * 0.1)
      }
    };

    if (mongoose.connection.readyState === 1) {
      // MongoDBが利用可能な場合はMongoDBに保存
      const travel = new Travel(travelData);
      const savedTravel = await travel.save();
      return res.status(201).json(savedTravel);
    }
    
    // MongoDBが利用できない場合はインメモリに保存
    const newTravel = {
      id: nextId.toString(),
      ...travelData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryTravels.unshift(newTravel);
    nextId++;
    res.status(201).json(newTravel);
  } catch (error) {
    console.error('旅行作成エラー:', error);
    res.status(500).json({ message: '旅行の作成に失敗しました' });
  }
});

// 旅行を更新
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;

    // 日付が含まれている場合はバリデーション
    if (startDate && endDate) {
      const dateValidation = validateTravelDates(startDate, endDate);
      if (!dateValidation.isValid) {
        return res.status(400).json({ 
          message: dateValidation.message 
        });
      }
    }

    if (mongoose.connection.readyState === 1) {
      const travel = await Travel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!travel) {
        return res.status(404).json({ message: '旅行が見つかりません' });
      }
      
      return res.json(travel);
    }
    
    // インメモリから更新
    const index = inMemoryTravels.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: '旅行が見つかりません' });
    }
    
    inMemoryTravels[index] = {
      ...inMemoryTravels[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json(inMemoryTravels[index]);
  } catch (error) {
    res.status(500).json({ message: '旅行の更新に失敗しました' });
  }
});

// 旅行を削除
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const travel = await Travel.findByIdAndDelete(req.params.id);
      
      if (!travel) {
        return res.status(404).json({ message: '旅行が見つかりません' });
      }
      
      return res.json({ message: '旅行が削除されました' });
    }
    
    // インメモリから削除
    const index = inMemoryTravels.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: '旅行が見つかりません' });
    }
    
    inMemoryTravels.splice(index, 1);
    res.json({ message: '旅行が削除されました' });
  } catch (error) {
    res.status(500).json({ message: '旅行の削除に失敗しました' });
  }
});

// AI観光地推薦API
router.post('/ai/recommend', async (req, res) => {
  try {
    const prefs = req.body;
    const result = await (await import('../services/aiService')).generateRecommendations(prefs);
    if (!result) {
      return res.status(500).json({ success: false, recommendations: [], message: 'AI推薦生成に失敗しました' });
    }
    const { success, recommendations } = result;
    res.json({ success, recommendations });
  } catch (error) {
    console.error('AI推薦APIエラー:', error);
    res.status(500).json({ success: false, message: 'AI推薦生成に失敗しました', error: error instanceof Error ? error.message : '不明なエラー' });
  }
});

// 画像OCR＋人名抽出API
router.post('/extract-names-from-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: '画像データがありません' });
    }
    const { extractNamesFromImage } = await import('../services/aiService');
    const names = await extractNamesFromImage(imageBase64);
    res.json({ names });
  } catch (error) {
    console.error('画像から人名抽出APIエラー:', error);
    res.status(500).json({ message: '画像から人名抽出に失敗しました' });
  }
});

export default router; 