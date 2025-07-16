-- Travel（旅行）
create table if not exists travel (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  duration text not null,
  dates text not null,
  description text,
  image text,
  status text not null default 'planning',
  member_count integer not null,
  budget integer not null,
  interests text[],
  travel_style text,
  schedule jsonb,
  places jsonb,
  budget_breakdown jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 既存のテーブルにカラムを追加（マイグレーション用）
ALTER TABLE travel ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE travel ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE travel ADD COLUMN IF NOT EXISTS schedule jsonb;
ALTER TABLE travel ADD COLUMN IF NOT EXISTS places jsonb;
ALTER TABLE travel ADD COLUMN IF NOT EXISTS budget_breakdown jsonb;

-- Schedule（スケジュール）
create table if not exists schedule (
  id uuid primary key default gen_random_uuid(),
  travel_id uuid references travel(id) on delete cascade,
  date date not null,
  day text,
  items jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Place（観光スポット）
create table if not exists place (
  id uuid primary key default gen_random_uuid(),
  travel_id uuid references travel(id) on delete cascade,
  schedule_id uuid references schedule(id) on delete set null,
  name text not null,
  category text,
  rating float,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Budget（予算）
create table if not exists budget (
  id uuid primary key default gen_random_uuid(),
  travel_id uuid references travel(id) on delete cascade,
  schedule_id uuid references schedule(id) on delete set null,
  amount integer not null,
  breakdown jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RoomAssignment（部屋割り）
create table if not exists room_assignment (
  id uuid primary key default gen_random_uuid(),
  travel_id uuid references travel(id) on delete cascade,
  schedule_id uuid references schedule(id) on delete set null,
  room_name text not null,
  members text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 部屋割りテーブルに泊数カラム追加
ALTER TABLE room_assignment ADD COLUMN IF NOT EXISTS nights integer NOT NULL DEFAULT 1;
-- 部屋割りテーブルに泊まる日付配列カラム追加
ALTER TABLE room_assignment ADD COLUMN IF NOT EXISTS stay_dates text[] NOT NULL DEFAULT ARRAY[]::text[];

-- Enable Row Level Security
ALTER TABLE public.travel ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.travel
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.travel
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.travel
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.travel
    FOR DELETE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_travel_updated_at BEFORE UPDATE ON public.travel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 