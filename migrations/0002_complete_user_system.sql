
-- Complete User Management System Migration
-- This migration creates all necessary tables for user authentication, profiles, and progress tracking

-- Create users table (enhanced version of existing sub_project_user_account)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    google_id TEXT UNIQUE,
    apple_id TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

-- Create user profiles for extended information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    child_name TEXT NOT NULL,
    parent_email TEXT,
    birth_date DATE,
    grade_level TEXT,
    learning_preferences JSONB DEFAULT '{}',
    accessibility_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create user settings
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'advanced')),
    sound_enabled BOOLEAN DEFAULT true,
    high_contrast BOOLEAN DEFAULT false,
    voice_speed NUMERIC DEFAULT 1.0,
    categories_enabled JSONB DEFAULT '{"animals": true, "fruits": true, "shapes": true, "colors": true, "sounds": true}',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create comprehensive progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stars INTEGER DEFAULT 0,
    badges INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    total_correct INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    achievements JSONB DEFAULT '[]',
    category_progress JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create quiz results for detailed tracking
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    question_id TEXT NOT NULL,
    question_text TEXT,
    selected_answer TEXT,
    correct_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    difficulty TEXT DEFAULT 'beginner',
    session_id UUID,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create story progress tracking
CREATE TABLE IF NOT EXISTS story_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    adventure_id TEXT NOT NULL,
    current_chapter_id TEXT,
    completed_chapters TEXT[] DEFAULT '{}',
    chapter_scores JSONB DEFAULT '{}',
    total_story_stars INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_played TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, adventure_id)
);

-- Create user achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    category TEXT,
    points INTEGER DEFAULT 0
);

-- Create learning analytics
CREATE TABLE IF NOT EXISTS learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE DEFAULT CURRENT_DATE,
    total_time_minutes INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    categories_played TEXT[] DEFAULT '{}',
    average_response_time NUMERIC,
    difficulty_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_category ON quiz_results(user_id, category);
CREATE INDEX IF NOT EXISTS idx_quiz_results_answered_at ON quiz_results(answered_at);
CREATE INDEX IF NOT EXISTS idx_story_progress_user ON story_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_date ON learning_analytics(user_id, session_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_progress_updated_at BEFORE UPDATE ON story_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can manage own profiles" ON user_profiles FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own progress" ON user_progress FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own quiz results" ON quiz_results FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own story progress" ON story_progress FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own achievements" ON user_achievements FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own analytics" ON learning_analytics FOR ALL USING (auth.uid()::text = user_id::text);
