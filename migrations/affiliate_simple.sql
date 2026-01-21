-- Simplified affiliate schema
-- Create affiliate metrics table
CREATE TABLE IF NOT EXISTS affiliate_metrics (
    id SERIAL PRIMARY KEY,
    total_products INTEGER DEFAULT 0,
    active_products INTEGER DEFAULT 0,
    cold_products INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2) DEFAULT 50.0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_commission DECIMAL(12,2) DEFAULT 0.00,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add affiliate columns to products (simplified)
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_commission DECIMAL(5,2) DEFAULT 40.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_materials_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_analyzed_at TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_activated_at TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_moved_at TIMESTAMP;

-- Create trigger for affiliate metrics update
CREATE OR REPLACE FUNCTION update_affiliate_metrics()
RETURNS VOID AS $$
BEGIN
    -- Calculate new affiliate metrics
    UPDATE affiliate_metrics SET
        total_products = (
            SELECT COUNT(*) FROM products WHERE affiliate_url IS NOT NULL
        ),
        active_products = (
            SELECT COUNT(*) FROM products WHERE affiliate_status = 'active'
        ),
        cold_products = (
            SELECT COUNT(*) FROM products WHERE affiliate_status = 'cold'
        ),
        avg_score = (
            SELECT COALESCE(AVG(performance_score), 50) FROM products WHERE affiliate_url IS NOT NULL
        ),
        total_revenue = (
            SELECT COALESCE(SUM(affiliate_monthly_revenue), 0) FROM affiliate_metrics WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        ),
        total_commission = (
            SELECT COALESCE(SUM(affiliate_commission), 0) FROM products WHERE affiliate_url IS NOT NULL
        ),
        success_rate = CASE 
            WHEN total_products = 0 THEN 0
            ELSE (
                ROUND((active_products + cold_products) * 100.0 / total_products, 2)
            ) END
    WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- Simple function to calculate affiliate score
CREATE OR REPLACE FUNCTION calculate_simple_affiliate_score(product_price DECIMAL, product_commission DECIMAL)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE 
        WHEN product_price IS NULL THEN 50
        WHEN product_commission IS NULL THEN 50
        ELSE 
            CASE 
                WHEN product_commission > 0.30 THEN 80
                WHEN product_commission > 0.20 THEN 90
                WHEN product_commission > 0.15 THEN 70
                WHEN product_commission > 0.10 THEN 60
                WHEN product_commission > 0.05 THEN 55
                ELSE 50
            END
    END;
END;
$$ LANGUAGE plpgsql;