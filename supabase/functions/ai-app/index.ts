import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google AI API設定
const GOOGLE_AI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-2.0:generateContent'

// AI生成関数
async function generateTravelPlan(requestData: any) {
  if (!GOOGLE_AI_API_KEY) {
    console.warn('Google AI API Key not found, returning dummy data');
    // return generateDummyPlan(requestData);
    throw new Error('Google AI API Key not configured');
  }

  try {
    const prompt = `
以下の条件で旅行プランを生成してください：

目的地: ${requestData.destination}
期間: ${requestData.startDate} 〜 ${requestData.endDate}
参加人数: ${requestData.memberCount}人
予算: ¥${requestData.budget.toLocaleString()}
興味: ${requestData.interests.join(', ')}
旅行スタイル: ${requestData.travelStyle}
旅行タイプ: ${requestData.travelType === 'international' ? '海外' : '国内'}

以下の形式でJSONを返してください：
{
  "title": "旅行タイトル",
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "day": "1日目",
      "items": [
        {
          "time": "HH:MM",
          "title": "スケジュールタイトル",
          "category": "food|sightseeing|transport|accommodation",
          "description": "詳細説明"
        }
      ]
    }
  ],
  "places": [
    {
      "name": "スポット名",
      "category": "sightseeing|food|accommodation",
      "description": "説明",
      "address": "住所",
      "openingHours": "営業時間",
      "priceRange": "価格帯"
    }
  ],
  "roomAssignments": [
    {
      "roomName": "部屋名",
      "members": ["メンバー1", "メンバー2"]
    }
  ],
  "packingList": [
    {
      "item": "アイテム名",
      "category": "important|clothing|toiletries|electronics"
    }
  ]
}
`;

    const response = await fetch(GOOGLE_AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GOOGLE_AI_API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // JSONを抽出
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const planData = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: planData
      };
    } else {
      throw new Error('AI response does not contain valid JSON');
    }

  } catch (error) {
    console.error('Google AI API error:', error);
    // return generateDummyPlan(requestData);
    throw error;
  }
}

// ダミープラン生成（AI APIが利用できない場合）
/*
function generateDummyPlan(requestData: any) {
  const { destination, startDate, endDate, memberCount, budget, interests, travelStyle, travelType } = requestData;
  
  return {
    success: true,
    data: {
      title: `${destination}旅行`,
      destination: destination,
      startDate: startDate,
      endDate: endDate,
      memberCount: memberCount,
      budget: budget,
      duration: `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}泊${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}日`,
      schedule: [
        {
          date: startDate,
          day: '1日目',
          items: [
            {
              time: '09:00',
              title: '到着・チェックイン',
              category: 'accommodation',
              description: 'ホテルにチェックイン'
            },
            {
              time: '12:00',
              title: '昼食',
              category: 'food',
              description: '地元のレストランで昼食'
            },
            {
              time: '14:00',
              title: '観光スポット1',
              category: 'sightseeing',
              description: '主要観光地を訪問'
            }
          ]
        }
      ],
      places: [
        {
          name: '観光スポット1',
          category: 'sightseeing',
          description: '人気の観光スポット',
          address: `${destination}の主要観光地`,
          openingHours: '09:00-17:00',
          priceRange: '¥1000-3000'
        },
        {
          name: 'レストラン1',
          category: 'food',
          description: '地元の美味しい料理',
          address: `${destination}の中心部`,
          openingHours: '11:00-22:00',
          priceRange: '¥2000-5000'
        }
      ],
      roomAssignments: [
        {
          roomName: '部屋1',
          members: [`メンバー1`, `メンバー2`]
        }
      ],
      packingList: [
        { item: 'パスポート', category: 'important' },
        { item: '現金・クレジットカード', category: 'important' },
        { item: '着替え', category: 'clothing' },
        { item: '歯ブラシ', category: 'toiletries' }
      ]
    }
  };
}
*/

serve(async (req) => {
  console.log('Edge Function called:', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  
  // CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pathname } = new URL(req.url)
    const method = req.method
    console.log('pathname:', pathname)

    // ヘルスチェック
    if ((pathname === '/health' || pathname === '/ai-app/health') && method === 'GET') {
      return new Response(
        JSON.stringify({ message: 'Travel App API is running' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // AIプラン生成エンドポイント
    if ((pathname === '/api/travels/generate-plan' || pathname === '/ai-app/api/travels/generate-plan') && method === 'POST') {
      console.log('AIプラン生成エンドポイントが呼び出されました');
      
      try {
        const requestData = await req.json()
        console.log('AIプラン生成リクエスト:', requestData)
        
        const result = await generateTravelPlan(requestData);
        
        console.log('AI生成結果:', result)

      return new Response(
          JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
      } catch (error) {
        console.error('AI生成エラー:', error)
      return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'AIプラン生成に失敗しました',
            message: error.message,
            details: error.stack
          }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        }
      )
      }
    }

    // 404エラー
    return new Response(
      JSON.stringify({ message: 'エンドポイントが見つかりません' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
      }
    )

  } catch (error) {
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    
    return new Response(JSON.stringify({
      message: 'サーバーエラーが発生しました',
      error: error && (error.message || JSON.stringify(error)),
      stack: error.stack,
      name: error.name
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
}) 