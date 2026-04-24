-- Run this in your Supabase SQL Editor

-- 1. Create Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    due_date TEXT,
    due_time TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "order" INTEGER NOT NULL,
    project_id UUID
);

-- 2. Create Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    category TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Daily Logs table
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    date TEXT NOT NULL,
    water_glasses INTEGER DEFAULT 0,
    mood INTEGER,
    energy INTEGER,
    sleep_start TEXT,
    sleep_end TEXT,
    sleep_quality INTEGER,
    journal_entry TEXT,
    gratitudes JSONB,
    intention TEXT,
    night_reflection TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- 4. Create Goals table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    deadline TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Milestones table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES goals ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Habits table
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Habit Logs table
CREATE TABLE habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID REFERENCES habits ON DELETE CASCADE NOT NULL,
    date TEXT NOT NULL,
    UNIQUE(habit_id, date)
);

-- 8. Create Budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    category TEXT NOT NULL,
    limit_amount NUMERIC NOT NULL,
    UNIQUE(user_id, category)
);

-- 9. Create Shopping Items table
CREATE TABLE shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    purchased BOOLEAN DEFAULT FALSE,
    price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Meals table
CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Create Exercises table
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    intensity TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Create Persons table
CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    birthday TEXT,
    last_contact TEXT,
    reminder_frequency_days INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Create Learning Items table
CREATE TABLE learning_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    progress INTEGER,
    notes TEXT,
    completed_at TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Create Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Create state synchronization JSON fallback table (Optional but useful for custom states like XP, levels, username metadata)
CREATE TABLE user_profiles (
    user_id UUID REFERENCES auth.users PRIMARY KEY NOT NULL,
    user_name TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    journal_pin_hash TEXT,
    app_state JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;


-- CREATE RLS POLICIES
CREATE POLICY "Users can manage their own data" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON daily_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON milestones FOR ALL USING (
    goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage their own data" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON habit_logs FOR ALL USING (
    habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage their own data" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON shopping_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON exercises FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON persons FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON learning_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON user_profiles FOR ALL USING (auth.uid() = user_id);
