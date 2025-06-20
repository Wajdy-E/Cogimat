-- Admin Videos Table Schema
-- This table stores videos uploaded by admins that are accessible to all users

CREATE TABLE IF NOT EXISTS admin_videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    video_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL, -- clerk_id of the admin
    exercise_id INTEGER, -- Reference to specific exercise (NULL for general videos)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}'
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_videos_category ON admin_videos(category);
CREATE INDEX IF NOT EXISTS idx_admin_videos_uploaded_by ON admin_videos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_admin_videos_created_at ON admin_videos(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_videos_exercise_id ON admin_videos(exercise_id);

-- Add comments for documentation
COMMENT ON TABLE admin_videos IS 'Stores videos uploaded by admins that are accessible to all users';
COMMENT ON COLUMN admin_videos.title IS 'Title of the video';
COMMENT ON COLUMN admin_videos.description IS 'Optional description of the video content';
COMMENT ON COLUMN admin_videos.category IS 'Category for organizing videos (e.g., tutorials, announcements, etc.)';
COMMENT ON COLUMN admin_videos.video_url IS 'Public URL of the uploaded video file';
COMMENT ON COLUMN admin_videos.file_name IS 'Original filename of the uploaded video';
COMMENT ON COLUMN admin_videos.file_size IS 'Size of the video file in bytes';
COMMENT ON COLUMN admin_videos.content_type IS 'MIME type of the video file';
COMMENT ON COLUMN admin_videos.uploaded_by IS 'Clerk ID of the admin who uploaded the video';
COMMENT ON COLUMN admin_videos.exercise_id IS 'Reference to specific exercise (NULL for general videos)';
COMMENT ON COLUMN admin_videos.is_active IS 'Whether the video is currently available to users';
COMMENT ON COLUMN admin_videos.view_count IS 'Number of times the video has been viewed';
COMMENT ON COLUMN admin_videos.tags IS 'Array of tags for better organization and search'; 