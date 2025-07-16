-- PackingItem（持ち物リスト）
create table if not exists packing_item (
  id uuid primary key default gen_random_uuid(),
  travel_id text not null,
  name text not null,
  category text not null,
  quantity integer not null default 1,
  is_packed boolean not null default false,
  is_essential boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
ALTER TABLE public.packing_item ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.packing_item;
CREATE POLICY "Enable read access for all users" ON public.packing_item
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.packing_item;
CREATE POLICY "Enable insert access for all users" ON public.packing_item
    FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update access for all users" ON public.packing_item;
CREATE POLICY "Enable update access for all users" ON public.packing_item
    FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.packing_item;
CREATE POLICY "Enable delete access for all users" ON public.packing_item
    FOR DELETE USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_packing_item_updated_at BEFORE UPDATE ON public.packing_item
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PackingItemテンプレート（国内）
insert into packing_item (travel_id, name, category, quantity, is_packed, is_essential)
values
  ('template_domestic', '身分証明書', '書類', 1, false, true),
  ('template_domestic', '現金・クレジットカード', '書類', 1, false, true),
  ('template_domestic', 'Tシャツ', '衣類', 3, false, false),
  ('template_domestic', 'ズボン・スカート', '衣類', 2, false, false),
  ('template_domestic', '下着', '衣類', 3, false, false),
  ('template_domestic', '靴下', '衣類', 3, false, false),
  ('template_domestic', 'パジャマ', '衣類', 1, false, false),
  ('template_domestic', '歯ブラシ・歯磨き粉', '美容・健康', 1, false, true),
  ('template_domestic', 'シャンプー・ボディソープ', '美容・健康', 1, false, false),
  ('template_domestic', 'タオル', '美容・健康', 1, false, true),
  ('template_domestic', 'スマートフォン', '電子機器', 1, false, true),
  ('template_domestic', '充電器', '電子機器', 1, false, true),
  ('template_domestic', 'モバイルバッテリー', '電子機器', 1, false, false),
  ('template_domestic', 'カメラ', '電子機器', 1, false, false),
  ('template_domestic', '常備薬', '美容・健康', 1, false, true),
  ('template_domestic', '日焼け止め', '美容・健康', 1, false, false),
  ('template_domestic', 'サングラス', 'アクセサリー', 1, false, false),
  ('template_domestic', '帽子', 'アクセサリー', 1, false, false),
  ('template_domestic', '傘', 'その他', 1, false, false),
  ('template_domestic', 'ゴミ袋', 'その他', 3, false, false)
;

-- PackingItemテンプレート（海外）
insert into packing_item (travel_id, name, category, quantity, is_packed, is_essential)
values
  ('template_overseas', 'パスポート', '書類', 1, false, true),
  ('template_overseas', 'ビザ（必要に応じて）', '書類', 1, false, false),
  ('template_overseas', '航空券', '書類', 1, false, true),
  ('template_overseas', '海外旅行保険証書', '書類', 1, false, true),
  ('template_overseas', '国際運転免許証（必要に応じて）', '書類', 1, false, false),
  ('template_overseas', '現金（現地通貨）', '書類', 1, false, true),
  ('template_overseas', 'クレジットカード', '書類', 1, false, true),
  ('template_overseas', 'Tシャツ', '衣類', 5, false, false),
  ('template_overseas', 'ズボン・スカート', '衣類', 3, false, false),
  ('template_overseas', '下着', '衣類', 5, false, false),
  ('template_overseas', '靴下', '衣類', 5, false, false),
  ('template_overseas', 'パジャマ', '衣類', 1, false, false),
  ('template_overseas', '歯ブラシ・歯磨き粉', '美容・健康', 1, false, true),
  ('template_overseas', 'シャンプー・ボディソープ', '美容・健康', 1, false, false),
  ('template_overseas', 'タオル', '美容・健康', 2, false, true),
  ('template_overseas', 'スマートフォン', '電子機器', 1, false, true),
  ('template_overseas', '充電器', '電子機器', 1, false, true),
  ('template_overseas', 'モバイルバッテリー', '電子機器', 1, false, true),
  ('template_overseas', 'カメラ', '電子機器', 1, false, false),
  ('template_overseas', '変換プラグ', '電子機器', 1, false, true),
  ('template_overseas', '常備薬', '美容・健康', 1, false, true),
  ('template_overseas', '日焼け止め', '美容・健康', 1, false, true),
  ('template_overseas', '虫除けスプレー', '美容・健康', 1, false, false),
  ('template_overseas', 'サングラス', 'アクセサリー', 1, false, false),
  ('template_overseas', '帽子', 'アクセサリー', 1, false, false),
  ('template_overseas', '傘', 'その他', 1, false, false),
  ('template_overseas', 'ゴミ袋', 'その他', 5, false, false),
  ('template_overseas', '辞書・翻訳アプリ', 'その他', 1, false, false),
  ('template_overseas', '現地の地図', 'その他', 1, false, false)
; 

-- travel_typeカラム追加（国内/海外判定用）
ALTER TABLE travel ADD COLUMN IF NOT EXISTS travel_type text NOT NULL DEFAULT 'domestic'; 

-- Place（観光スポット）にピン止め（お気に入り）機能追加
ALTER TABLE place ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

-- メモ（notes）テーブル
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_id uuid NOT NULL REFERENCES travels(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'その他',
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_travel_id ON notes(travel_id); 