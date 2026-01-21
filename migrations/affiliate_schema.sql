-- Add affiliate columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_commission DECIMAL(5,2) DEFAULT 40.00);
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_materials_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_analyzed_at TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_activated_at TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_last_sale_at TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_total_sales INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_monthly_revenue DECIMAL(10,2) DEFAULT 0.00);
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_success_rate DECIMAL(5,2) DEFAULT 0.00;

-- Add affiliate metrics table
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_affiliate_status ON products(affiliate_status);
CREATE INDEX IF NOT EXISTS idx_products_affiliate_score ON products(affiliate_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_affiliate_last_sale_at ON products(affiliate_last_sale_at DESC);

-- Create trigger for affiliate metrics updates
CREATE OR REPLACE FUNCTION update_affiliate_metrics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE affiliate_metrics 
    SET 
        total_clicks = COALESCE(am.affiliate_metrics.total_clicks, COALESCE(p.total_clicks, 0)) + NEW.total_clicks),
        unique_visitors = COALESCE(am.affiliate_metrics.unique_visitors, COALESCE(p.unique_visitors, 0)) + NEW.unique_visitors),
        conversions = COALESCE(am.affiliate_metrics.conversions, COALESCE(p.conversions, 0)) + NEW.conversions),
        revenue = COALESCE(am.affiliate_metrics.revenue, COALESCE(p.revenue, 0)) + NEW.revenue,
        commission_earned = COALESCE(am.affiliate_metrics.commission_earned, COALESCE(p.commission_earned, 0)) + NEW.commission_earned
    WHERE NEW.product_id = OLD.product_id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_affiliate_metrics_update
    BEFORE UPDATE ON products
    FOR EACH ROW
    WHEN OLD.affiliate_status = 'active' AND (
        OLD.total_clicks != NEW.total_clicks OR 
        OLD.unique_visitors != NEW.unique_visitors OR
        OLD.conversions != NEW.conversions OR
        OLD.revenue != NEW.revenue OR
        OLD.commission_earned != NEW.commission_earned
    )
    EXECUTE FUNCTION update_affiliate_metrics(NEW, OLD);
END;