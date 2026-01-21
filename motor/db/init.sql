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
