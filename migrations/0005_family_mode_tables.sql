-- Migration 0005: Family Mode Tables
-- Description: Creates tables for family learning sessions, members, and challenges

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child', 'sibling', 'grandparent', 'guardian')),
  avatar TEXT,
  age INTEGER,
  preferences JSONB DEFAULT '{
    "difficulty": "medium",
    "categories": ["animals", "fruits", "shapes"],
    "participationStyle": "active"
  }',
  stats JSONB DEFAULT '{
    "sessionsPlayed": 0,
    "questionsAnswered": 0,
    "helpGiven": 0,
    "encouragementGiven": 0
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create family_sessions table
CREATE TABLE IF NOT EXISTS family_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('collaborative', 'turn-based', 'team-challenge', 'story-time')),
  participants JSONB NOT NULL DEFAULT '[]',
  leader_id UUID,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('mixed', 'adaptive')),
  duration_minutes INTEGER DEFAULT 20,
  special_rules JSONB DEFAULT '{
    "helpAllowed": true,
    "discussionTime": 10,
    "drawingMode": false,
    "voiceAnswers": false
  }',
  questions_completed INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create family_challenges table
CREATE TABLE IF NOT EXISTS family_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'seasonal', 'milestone')),
  requirements JSONB NOT NULL DEFAULT '{
    "minParticipants": 2,
    "categories": [],
    "targetScore": 10
  }',
  rewards JSONB DEFAULT '{
    "familyBadge": "",
    "individualRewards": [],
    "unlockContent": null
  }',
  progress JSONB DEFAULT '{
    "completed": false,
    "currentScore": 0,
    "participatingMembers": []
  }',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create family_session_participants junction table
CREATE TABLE IF NOT EXISTS family_session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES family_sessions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  help_given INTEGER DEFAULT 0,
  encouragement_given INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, member_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_sessions_user_id ON family_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_family_sessions_started_at ON family_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_family_challenges_user_id ON family_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_family_challenges_type ON family_challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_family_session_participants_session ON family_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_family_session_participants_member ON family_session_participants(member_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_family_members_updated_at 
  BEFORE UPDATE ON family_members
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_challenges_updated_at 
  BEFORE UPDATE ON family_challenges
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_session_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own family members" 
  ON family_members FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own family sessions" 
  ON family_sessions FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own family challenges" 
  ON family_challenges FOR ALL 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own session participants" 
  ON family_session_participants FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM family_sessions 
      WHERE family_sessions.id = family_session_participants.session_id 
      AND auth.uid()::text = family_sessions.user_id::text
    )
  );

-- Insert sample family member roles for documentation
COMMENT ON TABLE family_members IS 'Stores family members who participate in learning sessions';
COMMENT ON TABLE family_sessions IS 'Tracks family learning sessions with collaborative quiz activities';
COMMENT ON TABLE family_challenges IS 'Stores family challenges for daily, weekly, and special events';
COMMENT ON TABLE family_session_participants IS 'Junction table linking family members to their session participation';

-- Migration complete
