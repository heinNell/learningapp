-- Migration 0006: Adaptive Learning System
-- Description: Creates tables for storing learning patterns, performance metrics, and personalized recommendations

-- Create learning_patterns table
CREATE TABLE IF NOT EXISTS learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  optimal_difficulty NUMERIC DEFAULT 0.5 CHECK (optimal_difficulty >= 0 AND optimal_difficulty <= 1),
  learning_speed TEXT DEFAULT 'medium' CHECK (learning_speed IN ('slow', 'medium', 'fast')),
  attention_span_minutes INTEGER DEFAULT 15,
  best_time_of_day TEXT DEFAULT 'afternoon' CHECK (best_time_of_day IN ('morning', 'afternoon', 'evening')),
  preferred_feedback_style TEXT DEFAULT 'immediate' CHECK (preferred_feedback_style IN ('immediate', 'delayed', 'minimal')),
  motivation_triggers TEXT[] DEFAULT '{"celebration", "progress", "achievement"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID,
  category TEXT NOT NULL,
  accuracy NUMERIC NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  average_response_time NUMERIC NOT NULL,
  streak_length INTEGER DEFAULT 0,
  session_duration_minutes NUMERIC NOT NULL,
  questions_attempted INTEGER NOT NULL,
  improvement_rate NUMERIC DEFAULT 0,
  consistency_score NUMERIC DEFAULT 0.5 CHECK (consistency_score >= 0 AND consistency_score <= 1),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  session_date DATE DEFAULT CURRENT_DATE
);

-- Create mistake_patterns table
CREATE TABLE IF NOT EXISTS mistake_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  error_type TEXT NOT NULL,
  question_id TEXT,
  selected_answer TEXT,
  correct_answer TEXT,
  frequency INTEGER DEFAULT 1,
  last_occurrence TIMESTAMPTZ DEFAULT NOW(),
  related_concepts TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create adaptive_recommendations table
CREATE TABLE IF NOT EXISTS adaptive_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('difficulty', 'category', 'break', 'review', 'challenge')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  reason TEXT NOT NULL,
  action TEXT NOT NULL,
  estimated_impact NUMERIC CHECK (estimated_impact >= 0 AND estimated_impact <= 1),
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  acted_on BOOLEAN DEFAULT false,
  acted_at TIMESTAMPTZ
);

-- Create learning_sessions_summary table for analytics
CREATE TABLE IF NOT EXISTS learning_sessions_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  total_time_minutes INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  categories_practiced TEXT[] DEFAULT '{}',
  average_accuracy NUMERIC,
  peak_performance_hour INTEGER,
  recommendations_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_patterns_user_category ON learning_patterns(user_id, category);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(session_date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_category ON performance_metrics(category);
CREATE INDEX IF NOT EXISTS idx_mistake_patterns_user_category ON mistake_patterns(user_id, category);
CREATE INDEX IF NOT EXISTS idx_mistake_patterns_frequency ON mistake_patterns(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_adaptive_recommendations_user ON adaptive_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_recommendations_active ON adaptive_recommendations(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_date ON learning_sessions_summary(user_id, session_date);

-- Create updated_at triggers
CREATE TRIGGER update_learning_patterns_updated_at 
  BEFORE UPDATE ON learning_patterns
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mistake_patterns_updated_at 
  BEFORE UPDATE ON mistake_patterns
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own learning patterns" 
  ON learning_patterns FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own performance metrics" 
  ON performance_metrics FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own mistake patterns" 
  ON mistake_patterns FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own recommendations" 
  ON adaptive_recommendations FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own session summaries" 
  ON learning_sessions_summary FOR ALL 
  USING (auth.uid()::text = user_id::text);

-- Create function to auto-generate daily recommendations
CREATE OR REPLACE FUNCTION generate_daily_recommendations()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-generate recommendations based on performance metrics
  IF NEW.accuracy < 0.5 THEN
    INSERT INTO adaptive_recommendations (user_id, recommendation_type, priority, reason, action, estimated_impact, confidence, category)
    VALUES (
      NEW.user_id,
      'difficulty',
      'high',
      'Low accuracy suggests current difficulty is too high',
      'Decrease difficulty level',
      0.7,
      0.85,
      NEW.category
    );
  ELSIF NEW.accuracy > 0.9 AND NEW.average_response_time < 3 THEN
    INSERT INTO adaptive_recommendations (user_id, recommendation_type, priority, reason, action, estimated_impact, confidence, category)
    VALUES (
      NEW.user_id,
      'difficulty',
      'high',
      'High accuracy with fast response times indicates readiness for more challenge',
      'Increase difficulty level',
      0.8,
      0.9,
      NEW.category
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-recommendations
CREATE TRIGGER auto_generate_recommendations
  AFTER INSERT ON performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION generate_daily_recommendations();

-- Add table comments
COMMENT ON TABLE learning_patterns IS 'Stores individual learning patterns and preferences per category';
COMMENT ON TABLE performance_metrics IS 'Tracks detailed performance metrics for each learning session';
COMMENT ON TABLE mistake_patterns IS 'Analyzes common mistakes to provide targeted practice';
COMMENT ON TABLE adaptive_recommendations IS 'Generates personalized learning recommendations';
COMMENT ON TABLE learning_sessions_summary IS 'Daily summary of learning activities for analytics';

-- Migration complete
