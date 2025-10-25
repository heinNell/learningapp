-- 0004_complete_story_integration.sql
-- Complete Story Integration Migration
-- Migrates all story data to Supabase while preserving rich frontend structure

-- Add missing columns to adventures table
ALTER TABLE adventures ADD COLUMN IF NOT EXISTS character_data JSONB NOT NULL DEFAULT '{}';
ALTER TABLE adventures ADD COLUMN IF NOT EXISTS final_reward TEXT;
ALTER TABLE adventures ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to chapters table  
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS setting TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS background_image TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS completion_reward TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create user_adventure_progress table for detailed story tracking
CREATE TABLE IF NOT EXISTS user_adventure_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    adventure_id TEXT NOT NULL,
    current_chapter_id TEXT,
    chapters_completed TEXT[] DEFAULT '{}',
    total_questions_answered INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, adventure_id)
);

-- Create chapter_completions table for detailed chapter tracking
CREATE TABLE IF NOT EXISTS chapter_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    adventure_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    questions_answered INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    completion_time_seconds INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, adventure_id, chapter_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_adventure_progress_user_id ON user_adventure_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_adventure_progress_adventure_id ON user_adventure_progress(adventure_id);
CREATE INDEX IF NOT EXISTS idx_chapter_completions_user_id ON chapter_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_completions_adventure_id ON chapter_completions(adventure_id);

-- Clear existing data and insert complete story data
DELETE FROM story_progress;
DELETE FROM chapters;
DELETE FROM adventures;

-- Insert all adventures with complete character data
INSERT INTO adventures (id, title, description, category_id, difficulty, total_chapters, unlock_requirement, character_data, final_reward, is_active) VALUES
('safari_adventure', 'The Great Safari Adventure', 'Join Leo the Lion on an epic journey through different habitats to meet amazing animals!', 'animals', 'beginner', 3, 0, 
 '{"id": "leo_lion", "name": "Leo the Lion", "avatar": "🦁", "personality": "brave", "catchphrase": "Roar with knowledge!", "introduction": "Greetings, young explorer! I am Leo, the bravest lion in the Animal Kingdom. Join me on a wild safari adventure!", "encouragement": ["You are as brave as a lion!", "Keep exploring, young adventurer!", "Your curiosity makes you stronger!", "Every great explorer makes mistakes - let us try again!"], "celebration": ["Magnificent! You have earned your explorer stripes!", "Roar-some job! The animals are impressed!", "You are becoming a true wildlife expert!", "Outstanding! Even the king of the jungle is proud!"], "comfort": ["Do not worry, every great explorer learns from their journey!", "The best adventurers never give up!", "You are doing great - let us discover more together!"]}', 
 'Master Wildlife Guardian Certificate', true),

('garden_adventure', 'The Magical Garden Quest', 'Help Ruby the Rabbit tend to the enchanted fruit garden and learn about delicious fruits!', 'fruits', 'beginner', 3, 0,
 '{"id": "ruby_rabbit", "name": "Ruby the Rabbit", "avatar": "🐰", "personality": "friendly", "catchphrase": "Hop into learning!", "introduction": "Hi there! I am Ruby, and I love hopping through the Magical Garden! Want to discover the most delicious fruits with me?", "encouragement": ["You are berry good at this!", "Keep hopping toward success!", "Your learning is growing like a beautiful garden!", "Every seed of knowledge will bloom!"], "celebration": ["Fan-tas-tic! You have harvested great knowledge!", "Sweet success! You know your fruits!", "You are the best garden helper ever!", "Absolutely a-peel-ing work!"], "comfort": ["Do not worry, every garden needs time to grow!", "The sweetest fruits come to those who keep trying!", "You are planting seeds of wisdom!"]}',
 'Master Gardener Certificate', true),

('cosmic_adventure', 'The Cosmic Shape Journey', 'Travel through space with Stella the Star to discover geometric wonders across the universe!', 'shapes', 'beginner', 3, 0,
 '{"id": "stella_star", "name": "Stella the Star", "avatar": "⭐", "personality": "wise", "catchphrase": "Shape your destiny!", "introduction": "Welcome to the Cosmic Shape Realm! I am Stella, your guide through the geometric wonders of the universe!", "encouragement": ["You are shaping up to be amazing!", "Your mind is as bright as a star!", "Every shape tells a cosmic story!", "The universe believes in you!"], "celebration": ["Stellar performance! You have mastered the shapes!", "You are a geometric genius!", "The cosmos celebrates your wisdom!", "Shape-tacular! You are a star!"], "comfort": ["Even stars need time to shine their brightest!", "The universe is patient with all learners!", "Your potential is infinite like space itself!"]}',
 'Master Cosmic Architect Certificate', true),

('rainbow_adventure', 'The Rainbow Phoenix Quest', 'Join Rainbow the Phoenix on a magical journey to restore colors to the world!', 'colors', 'beginner', 3, 0,
 '{"id": "rainbow_phoenix", "name": "Rainbow the Phoenix", "avatar": "🌈", "personality": "playful", "catchphrase": "Paint the world with colors!", "introduction": "Hello, little artist! I am Rainbow, the Phoenix of Colors! Let us paint the world with knowledge and joy!", "encouragement": ["You are adding beautiful colors to the world!", "Your learning palette is expanding!", "Every color has its own magic!", "Keep painting your path to success!"], "celebration": ["Brilliant! You have created a masterpiece of knowledge!", "Color-ful job! You are a rainbow of talent!", "You have painted success with flying colors!", "Vibrant victory! You shine like a rainbow!"], "comfort": ["Every great artist starts with simple strokes!", "Colors are more beautiful when we take our time!", "Your creative spirit will guide you!"]}',
 'Master Color Phoenix Certificate', true),

('sound_adventure', 'The Enchanted Sound Forest', 'Explore the mystical Sound Forest with Echo the Owl to discover the secrets of every sound!', 'sounds', 'beginner', 3, 0,
 '{"id": "echo_owl", "name": "Echo the Owl", "avatar": "🦉", "personality": "curious", "catchphrase": "Listen to learn!", "introduction": "Hoot hoot! I am Echo, the wisest owl in the Sound Forest! Let us explore the magical world of sounds together!", "encouragement": ["Your ears are getting sharper!", "You are becoming a sound detective!", "Every sound tells a story!", "Listen carefully - wisdom is all around!"], "celebration": ["Hoot-ray! You have mastered the sounds!", "Sound-sational! Your ears are amazing!", "You have solved the mystery of sounds!", "Wise work! You are as clever as an owl!"], "comfort": ["The forest is patient with all young listeners!", "Every sound expert started just like you!", "Your curiosity will lead you to success!"]}',
 'Master Sound Sage Certificate', true);

-- Insert all chapters with complete story data
-- Safari Adventure Chapters
INSERT INTO chapters (id, adventure_id, chapter_number, title, description, questions_needed, unlock_requirement, setting, background_image, completion_reward, story_content, is_active) VALUES
('jungle_expedition', 'safari_adventure', 1, 'Jungle Expedition', 'Venture deep into the lush jungle to discover its wild inhabitants!', 3, 0, 'Dense jungle with towering trees and mysterious sounds', 'https://images.pexels.com/photos/975771/pexels-photo-975771.jpeg?auto=compress&cs=tinysrgb&w=800', 'Jungle Explorer Badge', '{"character_id": "leo_lion", "intro": "Welcome to the jungle, brave explorer! The trees whisper ancient secrets and the animals are waiting to meet you!", "setting_description": "You find yourself in a lush jungle where every leaf tells a story and every sound holds a mystery."}', true),

('savanna_quest', 'safari_adventure', 2, 'Savanna Quest', 'Cross the vast savanna to meet the majestic creatures of the plains!', 4, 5, 'Golden grasslands stretching to the horizon under the African sun', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=800', 'Savanna Ranger Badge', '{"character_id": "leo_lion", "intro": "The vast savanna stretches before us! Here, the kings and queens of the animal world roam free!", "setting_description": "Golden grasslands shimmer in the warm sun, home to the most majestic creatures on Earth."}', true),

('ocean_depths', 'safari_adventure', 3, 'Ocean Depths', 'Dive into the mysterious ocean to discover marine life!', 3, 15, 'Crystal blue waters teeming with colorful sea creatures', 'https://images.pexels.com/photos/1001594/pexels-photo-1001594.jpeg?auto=compress&cs=tinysrgb&w=800', 'Ocean Explorer Badge', '{"character_id": "leo_lion", "intro": "Even a lion can explore the ocean depths! Let us dive into this underwater wonderland!", "setting_description": "Crystal clear waters reveal a magical underwater world filled with colorful marine life."}', true),

-- Garden Adventure Chapters  
('orchard_awakening', 'garden_adventure', 1, 'Orchard Awakening', 'Wake up the sleepy orchard and help the fruit trees bloom!', 3, 0, 'A magical orchard with sparkling fruit trees', 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800', 'Garden Helper Badge', '{"character_id": "ruby_rabbit", "intro": "Hop hop! The orchard has been sleeping, but together we can wake it up with our knowledge!", "setting_description": "A peaceful orchard where fruit trees are just beginning to stir from their winter slumber."}', true),

('berry_patch_mystery', 'garden_adventure', 2, 'Berry Patch Mystery', 'Solve the mystery of the missing berries in the enchanted berry patch!', 4, 8, 'A colorful patch filled with berry bushes and friendly garden creatures', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800', 'Berry Detective Badge', '{"character_id": "ruby_rabbit", "intro": "Oh my carrots! Someone has been taking berries from our patch! Let us solve this fruity mystery together!", "setting_description": "A vibrant berry patch where something mysterious is happening - but what?"}', true),

('harvest_festival', 'garden_adventure', 3, 'Grand Harvest Festival', 'Celebrate the harvest with all the garden friends!', 3, 20, 'A festive garden party with fruits, flowers, and celebration', 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800', 'Harvest Master Badge', '{"character_id": "ruby_rabbit", "intro": "Hip hip hooray! It is time for the grandest celebration in the garden - the Harvest Festival!", "setting_description": "The garden is decorated with colorful fruits and flowers for the most wonderful celebration of the year."}', true),

-- Cosmic Adventure Chapters
('planet_discovery', 'cosmic_adventure', 1, 'Planet Discovery', 'Explore different planets, each with unique geometric features!', 3, 0, 'Colorful alien planets with geometric landscapes', 'https://images.pexels.com/photos/2156/sky-earth-space-working.jpg?auto=compress&cs=tinysrgb&w=800', 'Space Explorer Badge', '{"character_id": "stella_star", "intro": "Welcome to the cosmic realm! Each planet holds geometric secrets waiting to be discovered!", "setting_description": "You float among colorful planets, each one shaped by the power of geometry."}', true),

('constellation_creation', 'cosmic_adventure', 2, 'Constellation Creation', 'Connect the stars to create beautiful shape constellations!', 4, 10, 'The vast cosmos with twinkling stars waiting to be connected', 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=800', 'Star Mapper Badge', '{"character_id": "stella_star", "intro": "Look up at the infinite cosmos! We shall connect the stars to create magnificent geometric patterns!", "setting_description": "The night sky sparkles with countless stars, each one waiting to become part of a beautiful constellation."}', true),

('galaxy_architect', 'cosmic_adventure', 3, 'Galaxy Architect', 'Design your own galaxy using the power of geometric shapes!', 3, 25, 'A cosmic workshop where galaxies are born from geometric patterns', 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=800', 'Galaxy Builder Badge', '{"character_id": "stella_star", "intro": "You have learned so much! Now you are ready to architect your very own galaxy using geometric wisdom!", "setting_description": "In this cosmic workshop, swirling galaxies are born from the perfect arrangement of geometric shapes."}', true),

-- Rainbow Adventure Chapters
('color_kingdom', 'rainbow_adventure', 1, 'The Faded Kingdom', 'Help bring color back to the kingdom that lost its hues!', 3, 0, 'A once-colorful kingdom now in grayscale, waiting for color magic', 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800', 'Color Restorer Badge', '{"character_id": "rainbow_phoenix", "intro": "Oh no! This beautiful kingdom has lost all its colors! But together, we can bring back the rainbow magic!", "setting_description": "A magnificent kingdom that has somehow lost all its colors, waiting for the magic of knowledge to restore its beauty."}', true),

('prism_palace', 'rainbow_adventure', 2, 'The Prism Palace', 'Navigate through the magical prism palace where colors dance and play!', 4, 12, 'A crystalline palace where light refracts into beautiful rainbows', 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800', 'Prism Master Badge', '{"character_id": "rainbow_phoenix", "intro": "Welcome to the Prism Palace! Here, light dances and splits into all the colors of the rainbow!", "setting_description": "A magnificent crystal palace where every surface creates beautiful rainbows as light passes through."}', true),

('rainbow_celebration', 'rainbow_adventure', 3, 'The Great Rainbow Celebration', 'Celebrate the return of colors with a magnificent rainbow festival!', 3, 30, 'A vibrant celebration with rainbows, fireworks, and colorful joy', 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800', 'Rainbow Guardian Badge', '{"character_id": "rainbow_phoenix", "intro": "You have brought color back to the world! Let us celebrate with the most magnificent rainbow festival ever!", "setting_description": "The sky explodes with color as rainbows dance everywhere, celebrating the return of beauty to the world."}', true),

-- Sound Adventure Chapters
('whispering_woods', 'sound_adventure', 1, 'The Whispering Woods', 'Listen carefully to the gentle sounds of the forest awakening!', 3, 0, 'A peaceful forest where every leaf and branch creates gentle melodies', 'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=800', 'Forest Listener Badge', '{"character_id": "echo_owl", "intro": "Hoot hoot! Welcome to the Whispering Woods, where every sound tells a story! Let us listen together!", "setting_description": "A serene forest where the wind through the leaves creates the most beautiful natural symphony."}', true),

('echo_caverns', 'sound_adventure', 2, 'The Echo Caverns', 'Venture into mysterious caverns where sounds bounce and multiply!', 4, 15, 'Mystical caverns with crystal formations that amplify every sound', 'https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800', 'Echo Master Badge', '{"character_id": "echo_owl", "intro": "These ancient caverns hold the secrets of echo and sound! Every whisper becomes a symphony here!", "setting_description": "Mysterious caverns where crystal formations create the most amazing echoes and sound effects."}', true),

('symphony_summit', 'sound_adventure', 3, 'Symphony Summit', 'Reach the highest peak where all the sounds of nature create a grand symphony!', 3, 35, 'A majestic mountain peak where all sounds unite in perfect harmony', 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800', 'Symphony Conductor Badge', '{"character_id": "echo_owl", "intro": "We have reached the Symphony Summit! Here, all the sounds of the world come together in perfect harmony!", "setting_description": "At the highest peak, where the wind, wildlife, and earth create nature\'s grandest symphony."}', true);

-- Enable Row Level Security
ALTER TABLE user_adventure_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_adventure_progress
CREATE POLICY "Users can view own adventure progress" ON user_adventure_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own adventure progress" ON user_adventure_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own adventure progress" ON user_adventure_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for chapter_completions
CREATE POLICY "Users can view own chapter completions" ON chapter_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chapter completions" ON chapter_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_adventure_progress
CREATE TRIGGER update_user_adventure_progress_updated_at
    BEFORE UPDATE ON user_adventure_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT ON adventures TO anon, authenticated;
GRANT SELECT ON chapters TO anon, authenticated;
GRANT ALL ON user_adventure_progress TO authenticated;
GRANT ALL ON chapter_completions TO authenticated;