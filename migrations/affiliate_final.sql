-- Add only essential affiliate columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_status VARCHAR(20) DEFAULT 'pending';

-- Simple affiliate metrics table
CREATE TABLE IF NOT EXISTS affiliate_metrics (
    id SERIAL PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    total_clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to update affiliate metrics
CREATE OR REPLACE FUNCTION update_affiliate_metrics()RETURNS TRIGGER AS $$
BEGIN
    UPDATE affiliate_metrics 
    SET 
        total_clicks = COALESCE(am.affiliate_metrics.total_clicks, COALESCE(p.total_clicks, 0)) + NEW.total_clicks),
        conversions = COALESCE(am.affiliate_metrics.conversions, COALESCE(p.conversions, 0)) + NEW.conversions),
        revenue = COALESCE(am.affiliate_metrics.revenue, COALESCE(p.revenue, 0)) + NEW.revenue,
        commission_earned = COALESCE(am.affiliate_metrics.commission_earned, COALESCE(p.commission_earned, 0)) + NEW.commission_earned
    WHERE NEW.product_id = OLD.product_id;
END;
$$ LANGUAGE plpgsql;