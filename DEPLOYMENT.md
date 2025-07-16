# Supabase デプロイ手順

## 前提条件

1. Supabaseアカウントを作成済み
2. Supabase CLIがインストール済み（またはブラウザからデプロイ）

## 手順

### 1. Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 「New Project」をクリック
3. プロジェクト名を「shiori-travel-app」として作成
4. データベースパスワードを設定して記録

### 2. 環境変数の設定

Supabase Dashboardで以下の環境変数を設定：

```
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 3. データベーステーブルの作成

Supabase DashboardのSQL Editorで以下のSQLを実行：

```sql
-- Create travels table
CREATE TABLE IF NOT EXISTS public.travels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    destination TEXT NOT NULL,
    budget DECIMAL(10,2),
    participants TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.travels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.travels
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.travels
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.travels
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.travels
    FOR DELETE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_travels_updated_at BEFORE UPDATE ON public.travels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Edge Functionsのデプロイ

#### 方法A: Supabase CLIを使用（推奨）

```bash
# Supabase CLIをインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref your-project-ref

# Edge Functionsをデプロイ
supabase functions deploy travel-api
```

#### 方法B: ブラウザからデプロイ

1. Supabase Dashboardの「Edge Functions」セクションに移動
2. 「Create a new function」をクリック
3. 関数名を「travel-api」として作成
4. `supabase/functions/travel-api/index.ts`の内容をコピー＆ペースト
5. 「Deploy」をクリック

### 5. フロントエンドの設定更新

`src/services/api.ts`のベースURLを更新：

```typescript
const API_BASE_URL = 'https://your-project-ref.supabase.co/functions/v1/travel-api';
```

### 6. 動作確認

以下のエンドポイントでAPIが動作することを確認：

- `GET /health` - ヘルスチェック
- `GET /api/travels` - 旅行一覧取得
- `POST /api/travels` - 旅行作成
- `GET /api/travels/:id` - 特定の旅行取得
- `PUT /api/travels/:id` - 旅行更新
- `DELETE /api/travels/:id` - 旅行削除
- `POST /api/ai-recommendations` - AI推奨機能

## トラブルシューティング

### よくある問題

1. **CORSエラー**: Edge Functionsの設定でCORSが正しく設定されているか確認
2. **環境変数エラー**: Supabase Dashboardで環境変数が正しく設定されているか確認
3. **データベース接続エラー**: RLSポリシーが正しく設定されているか確認

### ログの確認

Supabase Dashboardの「Edge Functions」→「travel-api」→「Logs」でログを確認できます。 

## 1. Supabase CLIのインストールができない場合

### よくあるエラー
- `npm install -g supabase` でエラーが出る
- 権限エラーや「グローバルインストールはサポートされていません」と表示される

### 対処法
#### A. PowerShellでインストール（Windows向け公式推奨）
PowerShellを「管理者として実行」し、下記コマンドをコピー＆ペーストしてください。

```powershell
iwr -useb https://cli.supabase.com/install.ps1 | iex
```

#### B. Homebrew（Mac/Linuxの場合）
```bash
brew install supabase/tap/supabase
```

---

## 2. それでもダメな場合

- エラー内容をコピーして、ここに貼り付けてください。
- どの手順で止まったか、どんな表示が出たか教えてください。

---

## 3. どうしてもCLIが使えない場合

- Supabaseダッシュボードの「Edge Functions」から**ブラウザで直接デプロイ**も可能です。
- `supabase/functions/travel-api/index.ts` の内容をコピーして、ダッシュボードで新規関数として貼り付け、「Deploy」ボタンを押すだけです。

---

### どこで詰まっているか、もう少し詳しく教えていただけますか？  
（例：「インストールでエラー」「ログインできない」「デプロイで失敗」など）

一緒に解決しましょう！ 