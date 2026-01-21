-- Add affiliate columns to products table (simplified version)
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_commission DECIMAL(5,2) DEFAULT 40.00);
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_materials_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_activated_at TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_last_sale_at TIMESTAMP;
ALTER TABLE ADD COLUMN IF NOT EXISTS affiliate_total_sales INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_monthly_revenue DECIMAL(10,2) DEFAULT 0.00);

-- Create affiliate metrics table
CREATE TABLE IF NOT EXISTS affiliate_metrics (
    id SERIAL PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    total_clicks INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_affiliate_status ON products(affiliate_status);
CREATE INDEX IF NOT EXISTS idx_products_performance_score ON products(performance_score DESC);

-- Create function to calculate affiliate metrics
CREATE OR REPLACE FUNCTION calculate_affiliate_score() RETURNS INTEGER AS $$
BEGIN
    DECLARE
        base_score INTEGER := 50;
        days_active INTEGER := 0;
        sales_count INTEGER := 0;
        cold_penalty INTEGER := 0;
        success_bonus INTEGER := 0;
        
    SELECT 
        COALESCE(DATE_PART('day', AGE(NOW(), created_at)) * 24) INTO days_active,
        COALESCE(sales_count, 0) INTO sales_count,
        CASE 
            WHEN status = 'active' THEN 25
            WHEN status = 'cold' THEN -40
            ELSE 0
        END AS cold_penalty,
        CASE 
            WHEN performance_score > 80 THEN 25
            WHEN performance_score > 50 THEN 10
            ELSE 0
        END AS success_bonus
        FROM products 
    WHERE affiliate_url IS NOT NULL
    GROUP BY id;

    RETURN 
        COALESCE(AVG(base_score + cold_penalty + success_bonus), 0);
END;
$$ LANGUAGE plpgsql;

-- Update products with affiliate scores
UPDATE products 
SET affiliate_score = calculate_affiliate_score(),
    affiliate_status = CASE 
        WHEN affiliate_url IS NOT NULL AND performance_score > 80 THEN 'active'
        WHEN affiliate_url IS NOT NULL AND performance_score > 50 THEN 'testing'
        WHEN affiliate_url IS NOT NULL AND performance_score <= 50 THEN 'cold'
        ELSE 'pending'
    END,
    affiliate_activated_at = CASE 
        WHEN affiliate_url IS NOT NULL AND affiliate_status = 'active' THEN NOW()
        WHEN affiliate_url IS NOT NULL AND affiliate_status IN ('testing', 'active') THEN NOW()
        ELSE affiliate_activated_at
    END,
    last_affiliate_check = NOW()
WHERE affiliate_url IS NOT NULL;

-- Update timestamp when products are moved to cold
CREATE OR REPLACE FUNCTION move_to_cold_products() RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET 
        affiliate_status = 'cold',
        cold_moved_at = NOW(),
        performance_score = GREATEST(performance_score * 0.5, 10),
        cold_move_reason = 'Low performance for over 30 days'
    WHERE affiliate_url IS NOT NULL 
    AND affiliate_status = 'active' 
    AND (
        performance_score < 50 
        OR (SELECT 1 FROM (
            SELECT 1 FROM product_scores ps 
            WHERE ps.product_id = products.id 
            AND ps.last_calculated_at < NOW() - INTERVAL '30 days'
        ))
    );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last check when products become active again
CREATE OR REPLACE FUNCTION reactivate_cold_products() RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET 
        affiliate_status = 'testing',
        performance_score = LEAST(performance_score * 1.5, 100),
        reactivated_at = NOW(),
        cold_moved_at = NULL
    WHERE affiliate_status = 'cold' 
    AND performance_score > 60
    END;
$$ LANGUAGE plpgsql;