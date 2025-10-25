
-- Story Adventures System Migration
-- This migration creates tables for storing story adventures and chapters dynamically

-- Create adventures table
CREATE TABLE IF NOT EXISTS adventures (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    character_id TEXT NOT NULL,
    character_data JSONB NOT NULL,
    final_reward TEXT,
    unlock_requirement INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    adventure_id TEXT REFERENCES adventures(id) ON DELETE CASCADE,
    chapter_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    setting TEXT,
    background_image TEXT,
    unlock_requirement INTEGER DEFAULT 0,
    questions_needed INTEGER DEFAULT 3,
    completion_reward TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(adventure_id, chapter_order)
);

-- Create user adventure progress for detailed tracking
CREATE TABLE IF NOT EXISTS user_adventure_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    adventure_id TEXT REFERENCES adventures(id) ON DELETE CASCADE,
    current_chapter_id TEXT,
    chapters_completed TEXT[] DEFAULT '{}',
    chapter_scores JSONB DEFAULT '{}',
    total_stars INTEGER DEFAULT 0,
    completion_percentage NUMERIC DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_played TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, adventure_id)
);

-- Insert default adventures data
INSERT INTO adventures (id, category_id, title, description, character_id, character_data, final_reward) VALUES
('safari_adventure', 'animals', 'The Great Safari Adventure', 'Join Leo the Lion on an epic journey through different habitats to meet amazing animals!', 'leo_lion', 
'{"id": "leo_lion", "name": "Leo the Lion", "avatar": "🦁", "personality": "brave", "catchphrase": "Roar with knowledge!"}', 
'Master Wildlife Guardian Certificate'),

('garden_adventure', 'fruits', 'The Magical Garden Quest', 'Help Ruby the Rabbit tend to the enchanted fruit garden and learn about delicious fruits!', 'ruby_rabbit',
'{"id": "ruby_rabbit", "name": "Ruby the Rabbit", "avatar": "🐰", "personality": "friendly", "catchphrase": "Hop into learning!"}',
'Master Gardener Certificate'),

('cosmic_adventure', 'shapes', 'The Cosmic Shape Journey', 'Travel through space with Stella the Star to discover geometric wonders across the universe!', 'stella_star',
'{"id": "stella_star", "name": "Stella the Star", "avatar": "⭐", "personality": "wise", "catchphrase": "Shape your destiny!"}',
'Master Cosmic Architect Certificate'),

('rainbow_adventure', 'colors', 'The Rainbow Phoenix Quest', 'Join Rainbow the Phoenix on a magical journey to restore colors to the world!', 'rainbow_phoenix',
'{"id": "rainbow_phoenix", "name": "Rainbow the Phoenix", "avatar": "🌈", "personality": "playful", "catchphrase": "Paint the world with colors!"}',
'Master Color Phoenix Certificate'),

('sound_adventure', 'sounds', 'The Enchanted Sound Forest', 'Explore the mystical Sound Forest with Echo the Owl to discover the secrets of every sound!', 'echo_owl',
'{"id": "echo_owl", "name": "Echo the Owl", "avatar": "🦉", "personality": "curious", "catchphrase": "Listen to learn!"}',
'Master Sound Sage Certificate');

-- Insert chapters data
INSERT INTO chapters (id, adventure_id, chapter_order, title, description, setting, background_image, unlock_requirement, questions_needed, completion_reward) VALUES
-- Safari Adventure Chapters
('jungle_expedition', 'safari_adventure', 1, 'Jungle Expedition', 'Venture deep into the lush jungle to discover its wild inhabitants!', 'Dense jungle with towering trees and mysterious sounds', 'https://images.pexels.com/photos/975771/pexels-photo-975771.jpeg?auto=compress&cs=tinysrgb&w=800', 0, 3, 'Jungle Explorer Badge'),
('savanna_quest', 'safari_adventure', 2, 'Savanna Quest', 'Cross the vast savanna to meet the majestic creatures of the plains!', 'Golden grasslands stretching to the horizon under the African sun', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=800', 5, 4, 'Savanna Ranger Badge'),
('ocean_depths', 'safari_adventure', 3, 'Ocean Depths', 'Dive into the mysterious ocean to discover marine life!', 'Crystal blue waters teeming with colorful sea creatures', 'https://images.pexels.com/photos/1001594/pexels-photo-1001594.jpeg?auto=compress&cs=tinysrgb&w=800', 15, 3, 'Ocean Explorer Badge'),

-- Garden Adventure Chapters
('orchard_awakening', 'garden_adventure', 1, 'Orchard Awakening', 'Wake up the sleepy orchard and help the fruit trees bloom!', 'A magical orchard with sparkling fruit trees', 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800', 0, 3, 'Garden Helper Badge'),
('berry_patch_mystery', 'garden_adventure', 2, 'Berry Patch Mystery', 'Solve the mystery of the missing berries in the enchanted berry patch!', 'A colorful patch filled with berry bushes and friendly garden creatures', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800', 8, 4, 'Berry Detective Badge'),
('harvest_festival', 'garden_adventure', 3, 'Grand Harvest Festival', 'Celebrate the harvest with all the garden friends!', 'A festive garden party with fruits, flowers, and celebration', 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800', 20, 3, 'Harvest Master Badge'),

-- Cosmic Adventure Chapters
('planet_discovery', 'cosmic_adventure', 1, 'Planet Discovery', 'Explore different planets, each with unique geometric features!', 'Colorful alien planets with geometric landscapes', 'https://images.pexels.com/photos/2156/sky-earth-space-working.jpg?auto=compress&cs=tinysrgb&w=800', 0, 3, 'Space Explorer Badge'),
('constellation_creation', 'cosmic_adventure', 2, 'Constellation Creation', 'Connect the stars to create beautiful shape constellations!', 'The vast cosmos with twinkling stars waiting to be connected', 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=800', 10, 4, 'Star Mapper Badge'),
('galaxy_architect', 'cosmic_adventure', 3, 'Galaxy Architect', 'Design your own galaxy using the power of geometric shapes!', 'A cosmic workshop where galaxies are born from geometric patterns', 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=800', 25, 3, 'Galaxy Builder Badge'),

-- Rainbow Adventure Chapters
('color_kingdom', 'rainbow_adventure', 1, 'The Faded Kingdom', 'Help bring color back to the kingdom that lost its hues!', 'A once-colorful kingdom now in grayscale, waiting for color magic', 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800', 0, 3, 'Color Restorer Badge'),
('prism_palace', 'rainbow_adventure', 2, 'The Prism Palace', 'Navigate through the magical prism palace where colors dance and play!', 'A crystalline palace where light refracts into beautiful rainbows', 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800', 12, 4, 'Prism Master Badge'),
('rainbow_celebration', 'rainbow_adventure', 3, 'The Great Rainbow Celebration', 'Celebrate the return of colors with a magnificent rainbow festival!', 'A vibrant celebration with rainbows, fireworks, and colorful joy', 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800', 30, 3, 'Rainbow Guardian Badge'),

-- Sound Adventure Chapters
('whispering_woods', 'sound_adventure', 1, 'The Whispering Woods', 'Listen carefully to the gentle sounds of the forest awakening!', 'A peaceful forest where every leaf and branch creates gentle melodies', 'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=800', 0, 3, 'Forest Listener Badge'),
('echo_caverns', 'sound_adventure', 2, 'The Echo Caverns', 'Venture into mysterious caverns where sounds bounce and multiply!', 'Mystical caverns with crystal formations that amplify every sound', 'https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800', 15, 4, 'Echo Master Badge'),
('symphony_summit', 'sound_adventure', 3, 'Symphony Summit', 'Reach the highest peak where all the sounds of nature create a grand symphony!', 'A majestic mountain peak where all sounds unite in perfect harmony', 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800', 35, 3, 'Symphony Conductor Badge');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_adventures_category ON adventures(category_id);
CREATE INDEX IF NOT EXISTS idx_chapters_adventure ON chapters(adventure_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(adventure_id, chapter_order);
CREATE INDEX IF NOT EXISTS idx_user_adventure_progress_user ON user_adventure_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_adventure_progress_adventure ON user_adventure_progress(adventure_id);

-- Create updated_at triggers
CREATE TRIGGER update_adventures_updated_at BEFORE UPDATE ON adventures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_adventure_progress_updated_at BEFORE UPDATE ON user_adventure_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_adventure_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies (adventures and chapters are public, user progress is private)
CREATE POLICY "Adventures are publicly readable" ON adventures FOR SELECT USING (true);
CREATE POLICY "Chapters are publicly readable" ON chapters FOR SELECT USING (true);
CREATE POLICY "Users can manage own adventure progress" ON user_adventure_progress FOR ALL USING (auth.uid()::text = user_id::text);
