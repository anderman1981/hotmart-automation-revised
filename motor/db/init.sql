CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    hotmart_id VARCHAR(255),
    name VARCHAR(255),
    niche VARCHAR(255),
    url_sales_page TEXT,
    status VARCHAR(50) DEFAULT 'tracking',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_scores (
    product_id INT REFERENCES products(id),
    mean_prob FLOAT DEFAULT 0,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_metrics (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    sales_count INT DEFAULT 0,
    click_out_count INT DEFAULT 0,
    social_views INT DEFAULT 0,
    refund_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_events (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(50),
    event_type VARCHAR(50),
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Persistent Settings Tables
CREATE TABLE IF NOT EXISTS system_menu (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    path VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    platform VARCHAR(50),
    encrypted_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- Globe, Database, File
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_base (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255),
    content TEXT,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed basic menu if empty
INSERT INTO system_menu (id, label, path, is_default, sort_order) 
VALUES 
('dashboard', 'Dashboard', '/', TRUE, 0),
('products', 'Products', '/products', TRUE, 1),
('agents', 'Agents', '/agents', TRUE, 2)
ON CONFLICT DO NOTHING;
