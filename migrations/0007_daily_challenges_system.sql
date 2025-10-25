-- Migration 0007: Daily Challenges System
-- Description: Creates tables for daily challenges, streaks, and rewards

-- Create daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT DEFAULT 'daily' CHECK (challenge_type IN ('daily', 'weekly', 'special')),
  target_count INTEGER NOT NULL,
  current_count INTEGER DEFAULT 0,
  reward_name TEXT NOT NULL,
  reward_stars INTEGER DEFAULT 10,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_date)
);

-- Create challenge_completions table for tracking history
CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  stars_earned INTEGER NOT NULL,
  bonus_rewards JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_streaks table
CREATE TABLE IF NOT EXISTS daily_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  streak_milestones JSONB DEFAULT '[]',
  total_days_active INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create challenge_rewards table for bonus items
CREATE TABLE IF NOT EXISTS challenge_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('badge', 'stars', 'unlock', 'achievement')),
  reward_name TEXT NOT NULL,
  reward_value INTEGER,
  source_challenge_id UUID REFERENCES daily_challenges(id),
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_date ON daily_challenges(user_id, challenge_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_completed ON daily_challenges(completed, expires_at);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user ON challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_date ON challenge_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user ON daily_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_rewards_user ON challenge_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_rewards_unclaimed ON challenge_rewards(user_id, claimed) WHERE claimed = false;

-- Create trigger for updated_at
CREATE TRIGGER update_daily_streaks_updated_at 
  BEFORE UPDATE ON daily_streaks
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own daily challenges" 
  ON daily_challenges FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own challenge completions" 
  ON challenge_completions FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own streaks" 
  ON daily_streaks FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own rewards" 
  ON challenge_rewards FOR ALL 
  USING (auth.uid()::text = user_id::text);

-- Create function to auto-generate daily challenge
CREATE OR REPLACE FUNCTION generate_daily_challenge_for_user(p_user_id UUID)
RETURNS daily_challenges AS $$
DECLARE
  v_challenge daily_challenges;
  v_challenge_templates TEXT[][] := ARRAY[
    ARRAY['🌟 Daily Learning Star', 'Complete 5 quizzes today!', '5', 'Daily Star Badge', '10'],
    ARRAY['🎯 Quiz Master Challenge', 'Answer 3 quizzes perfectly today!', '3', 'Perfect Day Badge', '15'],
    ARRAY['🚀 Learning Streak', 'Complete 7 quizzes today!', '7', 'Super Learner Badge', '20'],
    ARRAY['🌈 Category Explorer', 'Try all 5 categories today!', '5', 'Explorer Badge', '12']
  ];
  v_random_template TEXT[];
  v_end_of_day TIMESTAMPTZ;
BEGIN
  -- Select random challenge template
  v_random_template := v_challenge_templates[floor(random() * array_length(v_challenge_templates, 1) + 1)];
  
  -- Calculate end of day
  v_end_of_day := (CURRENT_DATE + INTERVAL '1 day' - INTERVAL '1 second');
  
  -- Insert new challenge
  INSERT INTO daily_challenges (
    user_id,
    challenge_date,
    title,
    description,
    target_count,
    reward_name,
    reward_stars,
    expires_at
  ) VALUES (
    p_user_id,
    CURRENT_DATE,
    v_random_template[1],
    v_random_template[2],
    v_random_template[3]::INTEGER,
    v_random_template[4],
    v_random_template[5]::INTEGER,
    v_end_of_day
  )
  RETURNING * INTO v_challenge;
  
  RETURN v_challenge;
END;
$$ LANGUAGE plpgsql;

-- Create function to update streak
CREATE OR REPLACE FUNCTION update_daily_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
BEGIN
  -- Get or create streak record
  INSERT INTO daily_streaks (user_id, current_streak, longest_streak, last_activity_date, total_days_active)
  VALUES (p_user_id, 0, 0, CURRENT_DATE, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current streak data
  SELECT last_activity_date, current_streak 
  INTO v_last_activity, v_current_streak
  FROM daily_streaks 
  WHERE user_id = p_user_id;
  
  -- Update streak based on last activity
  IF v_last_activity = CURRENT_DATE THEN
    -- Already updated today, do nothing
    RETURN;
  ELSIF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE daily_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = CURRENT_DATE,
        total_days_active = total_days_active + 1
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE daily_streaks
    SET current_streak = 1,
        last_activity_date = CURRENT_DATE,
        total_days_active = total_days_active + 1
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add table comments
COMMENT ON TABLE daily_challenges IS 'Stores daily learning challenges for user engagement';
COMMENT ON TABLE challenge_completions IS 'Tracks historical challenge completions';
COMMENT ON TABLE daily_streaks IS 'Manages user daily activity streaks';
COMMENT ON TABLE challenge_rewards IS 'Stores earned rewards from challenge completions';

-- Migration complete
