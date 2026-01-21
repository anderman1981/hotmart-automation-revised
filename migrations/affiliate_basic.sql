-- Add affiliate URL column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_url TEXT;

-- Simple update for ContentAgent
-- Add affiliate link generation logic to ContentAgent.js