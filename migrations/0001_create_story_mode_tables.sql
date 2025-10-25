
-- Migration: Create story mode tables
-- Description: Sets up the database structure for story adventures, chapters, and user progress tracking

-- Create adventures table
CREATE TABLE IF NOT EXISTS adventures (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'beginner',
    total_chapters INTEGER NOT NULL DEFAULT 0,
    unlock_requirement INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    adventure_id TEXT NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    questions_needed INTEGER NOT NULL DEFAULT 5,
    unlock_requirement INTEGER NOT NULL DEFAULT 0,
    story_content JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(adventure_id, chapter_number)
);

-- Create story_progress table for tracking user progress through adventures
CREATE TABLE IF NOT EXISTS story_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    adventure_id TEXT NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    stars_earned INTEGER NOT NULL DEFAULT 0,
    completion_time_ms INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adventures_category ON adventures(category_id);
CREATE INDEX IF NOT EXISTS idx_chapters_adventure ON chapters(adventure_id);
CREATE INDEX IF NOT EXISTS idx_story_progress_user ON story_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_story_progress_adventure ON story_progress(adventure_id);
CREATE INDEX IF NOT EXISTS idx_story_progress_chapter ON story_progress(chapter_id);

-- Insert sample adventures
INSERT INTO adventures (id, title, description, category_id, difficulty, total_chapters, unlock_requirement) VALUES
('jungle-explorer', 'Jungle Explorer', 'Join Maya the monkey on an exciting jungle adventure!', 'animals', 'beginner', 3, 0),
('fruit-garden', 'Magical Fruit Garden', 'Help Berry the bear collect magical fruits in the enchanted garden!', 'fruits', 'beginner', 3, 10),
('shape-castle', 'Shape Castle Mystery', 'Solve shape puzzles with Geo the wizard in the mysterious castle!', 'shapes', 'beginner', 3, 20),
('color-rainbow', 'Rainbow Color Quest', 'Paint the world with Prism the unicorn in this colorful adventure!', 'colors', 'beginner', 3, 30);

-- Insert sample chapters for each adventure
-- Jungle Explorer chapters
INSERT INTO chapters (id, adventure_id, chapter_number, title, description, questions_needed, unlock_requirement, story_content) VALUES
('jungle-ch1', 'jungle-explorer', 1, 'Welcome to the Jungle', 'Maya introduces you to her jungle home and the animal friends who live there.', 5, 0, '{"intro": "Welcome to the jungle! I''m Maya, and I''ll be your guide.", "character": "maya", "setting": "jungle_entrance"}'),
('jungle-ch2', 'jungle-explorer', 2, 'River Crossing', 'Help Maya and friends cross the river by identifying different animals.', 5, 5, '{"intro": "We need to cross this river safely. Can you help identify the animals?", "character": "maya", "setting": "jungle_river"}'),
('jungle-ch3', 'jungle-explorer', 3, 'Treetop Adventure', 'Climb to the treetops and meet the flying animals of the jungle.', 5, 10, '{"intro": "Let''s climb up to the treetops and meet my flying friends!", "character": "maya", "setting": "jungle_canopy"}');

-- Fruit Garden chapters
INSERT INTO chapters (id, adventure_id, chapter_number, title, description, questions_needed, unlock_requirement, story_content) VALUES
('fruit-ch1', 'fruit-garden', 1, 'The Enchanted Garden', 'Berry discovers a magical garden where fruits have special powers.', 5, 0, '{"intro": "Welcome to my magical fruit garden! Each fruit here has special powers.", "character": "berry", "setting": "enchanted_garden"}'),
('fruit-ch2', 'fruit-garden', 2, 'Fruit Harvest', 'Help Berry collect the right fruits to make a magical smoothie.', 5, 5, '{"intro": "We need to harvest the right fruits for our magical recipe!", "character": "berry", "setting": "fruit_trees"}'),
('fruit-ch3', 'fruit-garden', 3, 'The Great Feast', 'Prepare a grand feast with all the magical fruits you''ve collected.', 5, 10, '{"intro": "Time for the grand feast! Let''s use all our magical fruits!", "character": "berry", "setting": "feast_table"}');

-- Shape Castle chapters
INSERT INTO chapters (id, adventure_id, chapter_number, title, description, questions_needed, unlock_requirement, story_content) VALUES
('shape-ch1', 'shape-castle', 1, 'Castle Gates', 'Geo the wizard teaches you about shapes to unlock the castle gates.', 5, 0, '{"intro": "Welcome to my castle! To enter, you must master the ancient art of shapes.", "character": "geo", "setting": "castle_entrance"}'),
('shape-ch2', 'shape-castle', 2, 'The Shape Library', 'Explore the magical library where books are shaped like geometric forms.', 5, 5, '{"intro": "In this library, knowledge is stored in shape-books. Let''s explore!", "character": "geo", "setting": "shape_library"}'),
('shape-ch3', 'shape-castle', 3, 'The Crown Room', 'Help Geo create a magical crown using the perfect combination of shapes.', 5, 10, '{"intro": "In the crown room, we''ll forge a magical crown with perfect shapes!", "character": "geo", "setting": "crown_chamber"}');

-- Rainbow Color Quest chapters
INSERT INTO chapters (id, adventure_id, chapter_number, title, description, questions_needed, unlock_requirement, story_content) VALUES
('color-ch1', 'color-rainbow', 1, 'The Faded World', 'Prism discovers that all colors have disappeared from the world.', 5, 0, '{"intro": "Oh no! All the colors have faded from our world. Help me bring them back!", "character": "prism", "setting": "faded_landscape"}'),
('color-ch2', 'color-rainbow', 2, 'Color Collection', 'Gather the primary colors to start restoring the world''s beauty.', 5, 5, '{"intro": "Let''s collect the primary colors first - they''re the key to everything!", "character": "prism", "setting": "color_crystals"}'),
('color-ch3', 'color-rainbow', 3, 'Rainbow Bridge', 'Create a magnificent rainbow bridge to restore color to the entire world.', 5, 10, '{"intro": "Now we can create the rainbow bridge that will restore all colors!", "character": "prism", "setting": "rainbow_bridge"}');

-- Update adventures with correct chapter counts
UPDATE adventures SET total_chapters = 3 WHERE id IN ('jungle-explorer', 'fruit-garden', 'shape-castle', 'color-rainbow');
