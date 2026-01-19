-- Exercise Completions Table Schema
-- This table tracks individual exercise completions with timestamps for analytics

CREATE TABLE IF NOT EXISTS exercise_completions (
    id SERIAL PRIMARY KEY,
    clerk_id VARCHAR(255) NOT NULL,
    exercise_id INTEGER NOT NULL,
    exercise_type VARCHAR(50) NOT NULL, -- 'standard', 'custom', or 'community'
    difficulty VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_exercise_completions_clerk_id ON exercise_completions(clerk_id);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_completed_at ON exercise_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_clerk_completed ON exercise_completions(clerk_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_exercise_id ON exercise_completions(exercise_id);

-- Add comments for documentation
COMMENT ON TABLE exercise_completions IS 'Stores individual exercise completion records with timestamps for analytics';
COMMENT ON COLUMN exercise_completions.clerk_id IS 'User identifier (Clerk ID)';
COMMENT ON COLUMN exercise_completions.exercise_id IS 'ID of the completed exercise';
COMMENT ON COLUMN exercise_completions.exercise_type IS 'Type of exercise: standard, custom, or community';
COMMENT ON COLUMN exercise_completions.difficulty IS 'Difficulty level: beginner, intermediate, or advanced';
COMMENT ON COLUMN exercise_completions.completed_at IS 'Timestamp when the exercise was completed';
