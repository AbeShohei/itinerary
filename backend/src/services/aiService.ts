import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

const getGenAIClient = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * 旅行プラン生成のためのプロンプトを作成
 */
const createTravelPrompt = (travelData: {
  destination: string;
  departure?: string;
  arrival?: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
  aiSuggestDestination?: boolean;
}) => {
  const { destination, departure, arrival, startDate, endDate, memberCount, budget, interests, travelStyle, description, aiSuggestDestination } = travelData;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const nights = days - 1;
  let destinationText = destination;
  if (!destination && aiSuggestDestination) {
    destinationText = '（未指定。出発地・到着地・テーマなどからAIが最適な目的地を提案してください）';
  }
  return `
以下の条件に基づいて、詳細な旅行プランを生成してください。

【旅行基本情報】
- 出発地: ${departure || '未指定'}
- 到着地: ${arrival || '未指定'}
- 目的地: ${destinationText}
- 旅行期間: ${startDate} から ${endDate} (${nights}泊${days}日)
- 参加人数: ${memberCount}名
- 予算: ¥${budget.toLocaleString()}
- 興味: ${interests.join(', ')}
- 旅行スタイル: ${travelStyle}
- 追加要望: ${description || '特になし'}

【出力形式】
以下のJSON形式で出力してください：
{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "day": "Day 1",
      "items": [
        {
          "time": "HH:MM",
          "title": "アクティビティ名",
          "location": "場所名",
          "description": "詳細説明",
          "category": "transport|sightseeing|food|accommodation|activity"
        }
      ]
    }
  ],
  "places": [
    {
      "name": "スポット名",
      "category": "カテゴリ",
      "rating": 4.5,
      "description": "説明"
    }
  ],
  "budget": {
    "transportation": 予算,
    "accommodation": 予算,
    "food": 予算,
    "activities": 予算
  },
  "recommendations": {
    "mustVisit": ["必見スポット1", "必見スポット2"],
    "localFood": ["地元グルメ1", "地元グルメ2"],
    "tips": ["旅行のコツ1", "旅行のコツ2"]
  }
}
【注意事項】
- 予算内で現実的なプランを作成してください
- 参加人数に応じた適切なアクティビティを提案してください
- 興味に基づいたスポットを選定してください
- 旅行スタイルに合わせたスケジュールにしてください
- 交通手段や移動時間も考慮してください
- 出発地から到着地までの移動も考慮してください
- 日本語で出力してください
`;
};

/**
 * Gemini APIを使用して旅行プランを生成
 */
export const generateTravelPlan = async (travelData: {
  destination: string;
  departure?: string;
  arrival?: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
  aiSuggestDestination?: boolean;
}) => {
  try {
    const model = getGenAIClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = createTravelPrompt(travelData);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    const plan = JSON.parse(jsonString);
    return {
      success: true,
      data: plan
    };
  } catch (error) {
    console.error('AIプラン生成エラー:', error);
    return {
      success: false,
      data: generateMockPlan(travelData),
      error: error instanceof Error ? error.message : 'AIプラン生成に失敗しました'
    };
  }
};

/**
 * モックプランを生成（フォールバック用）
 */
const generateMockPlan = (travelData: {
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
}) => {
  const { destination, startDate, endDate, budget, interests } = travelData;
  return {
    schedule: [
      {
        date: startDate,
        day: 'Day 1',
        items: [
          {
            time: '09:00',
            title: `${destination}到着`,
            location: destination,
            description: '空港・駅から目的地への移動',
            category: 'transport'
          },
          {
            time: '14:00',
            title: 'おすすめ観光スポット',
            location: `${destination}の名所`,
            description: `${interests.join('、')}に基づいたおすすめスポット`,
            category: 'sightseeing'
          }
        ]
      }
    ],
    places: [
      {
        name: `${destination}の人気スポット`,
        category: '観光地',
        rating: 4.5,
        description: 'AIが選んだおすすめの場所'
      }
    ],
    budget: {
      transportation: Math.round(budget * 0.3),
      accommodation: Math.round(budget * 0.4),
      food: Math.round(budget * 0.2),
      activities: Math.round(budget * 0.1)
    },
    recommendations: {
      mustVisit: [`${destination}の必見スポット`],
      localFood: [`${destination}の名物グルメ`],
      tips: ['現地の天気をチェックしましょう', '公共交通機関の時刻表を確認しましょう']
    }
  };
};

/**
 * AI観光地推薦API用
 */
export const generateRecommendations = async (prefs: {
  destination: string;
  region?: string;
  interests: string[];
  budget: string;
  travelStyle: string;
  groupSize: number;
  duration: number;
  customNote?: string;
}) => {
  const maxRetries = 3;
  const retryDelayMs = 3000;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = getGenAIClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `あなたはプロの旅行プランナーです。以下の条件に合う観光地・体験・グルメを日本語で推薦してください。\n\n各推薦には「name」「category（mustVisit, localFood, tipsのいずれか）」「description（100文字程度）」「image（画像URL）」「tags（3つ程度）」「rating（1.0〜5.0）」「aiReason（AIによる推薦理由）」「matchScore（1〜100）」「estimatedTime（例: 1時間）」「priceRange（例: ¥1000〜¥3000）」「isBookmarked（false固定）」を必ず含めてください。\n\n【条件】\n目的地: ${prefs.destination}\n${prefs.region ? `地域: ${prefs.region}` : ''}\n興味: ${prefs.interests.join(', ')}\n予算: ${prefs.budget}\n旅行スタイル: ${prefs.travelStyle}\n人数: ${prefs.groupSize}\n日数: ${prefs.duration}\n追加要望: ${prefs.customNote || '特になし'}\n\n【出力形式】\n[\n  {\n    "name": "金閣寺",\n    "category": "mustVisit",\n    "description": "金閣寺は京都を代表する観光名所で、黄金に輝く美しい建物が池に映える絶景スポットです。",\n    "image": "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg",\n    "tags": ["歴史", "絶景", "寺院"],\n    "rating": 4.8,\n    "aiReason": "京都観光で外せない定番スポットです。",\n    "matchScore": 95,\n    "estimatedTime": "1時間",\n    "priceRange": "¥400",\n    "isBookmarked": false\n  }\n]\n※10件程度返してください。`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[.*\]/s);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      const recommendations = JSON.parse(jsonString);
      return { success: true, recommendations };
    } catch (error: any) {
      const isOverloaded = error?.message?.includes('503') || error?.message?.includes('overloaded');
      if (attempt < maxRetries && isOverloaded) {
        console.warn(`Gemini API過負荷のため${retryDelayMs / 1000}秒後にリトライ（${attempt}回目）...`);
        await new Promise((res) => setTimeout(res, retryDelayMs));
        continue;
      }
      console.error('AI観光地推薦エラー:', error);
      return { success: false, recommendations: [], error: error instanceof Error ? error.message : 'AI推薦生成に失敗しました' };
    }
  }
};

/**
 * 画像OCR＋人名抽出API用
 */
export const extractNamesFromImage = async (imageBase64: string): Promise<string[]> => {
  // 本来はOCR＋人名抽出処理を実装するが、ここではモックで返す
  // TODO: Google Cloud Vision API等と連携する場合はここに実装
  // 例: 画像から「田中太郎」「山田花子」を検出したと仮定
  return ['田中太郎', '山田花子'];
};