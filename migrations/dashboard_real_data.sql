-- Generated Content Table
CREATE TABLE IF NOT EXISTS generated_content (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- 'post', 'article', 'video_script', 'image_prompt'
    title VARCHAR(255),
    content TEXT,
    platform VARCHAR(50), -- 'instagram', 'tiktok', 'blog', etc.
    agent_name VARCHAR(50),
    product_id INTEGER REFERENCES products(id),
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'scheduled'
    engagement_metrics JSONB, -- {likes, views, shares, comments}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Enhanced Products Table
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 40.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS selected_for_tracking BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_commissions DECIMAL(10,2) DEFAULT 0.00;

-- Agent Status Table
CREATE TABLE IF NOT EXISTS agent_status (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'inactive', -- 'active', 'inactive', 'error', 'processing'
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_task VARCHAR(255),
    performance_metrics JSONB, -- {tasks_completed, success_rate, avg_processing_time}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default agents if they don't exist
INSERT INTO agent_status (agent_name, status) VALUES 
('Detector', 'inactive'),
('Instagram', 'inactive'), 
('Content', 'inactive'),
('Learning', 'inactive'),
('Manager', 'inactive'),
('Affiliate', 'inactive'),
('Git', 'inactive')
ON CONFLICT (agent_name) DO NOTHING;

-- Function to update agent activity
CREATE OR REPLACE FUNCTION update_agent_activity(agent_name_param VARCHAR, new_status VARCHAR DEFAULT 'active', current_task_param VARCHAR DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    UPDATE agent_status 
    SET 
        status = new_status,
        last_activity = CURRENT_TIMESTAMP,
        current_task = COALESCE(current_task_param, current_task),
        updated_at = CURRENT_TIMESTAMP
    WHERE agent_name = agent_name_param;
END;
$$ LANGUAGE plpgsql;