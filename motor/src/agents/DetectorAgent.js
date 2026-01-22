import { launch } from 'puppeteer-core';
import { Pool } from 'pg';

const DetectorAgent = {
    name: 'DetectorAgent',
    browser: null,
    
    initialize: async function() {
        console.log('DetectorAgent initialized');
        return true;
    },
    
    scanMarket: async function() {
        console.log('🔍 Starting market scan for products in batches of 20...');
        
        // Mock data for now - in real implementation this would scrape Hotmart
        const mockProducts = [
            { hotmart_id: 'PROD123', name: 'Excel para Negocios', niche: 'Business', price: 97.00, commission_rate: 40 },
            { hotmart_id: 'PROD124', name: 'Curso de Manicure', niche: 'Beauty', price: 147.00, commission_rate: 40 },
            { hotmart_id: 'PROD125', name: 'Marketing Digital', niche: 'Marketing', price: 297.00, commission_rate: 40 },
            { hotmart_id: 'PROD126', name: 'Yoga para Principiantes', niche: 'Health', price: 67.00, commission_rate: 40 },
            { hotmart_id: 'PROD127', name: 'Python Bootcamp', niche: 'Technology', price: 197.00, commission_rate: 40 },
            { hotmart_id: 'PROD128', name: 'Receitas Fit', niche: 'Food', price: 47.00, commission_rate: 40 },
            { hotmart_id: 'PROD129', name: 'Inglês Fluente', niche: 'Education', price: 297.00, commission_rate: 40 },
            { hotmart_id: 'PROD130', name: 'Guitarra Online', niche: 'Music', price: 97.00, commission_rate: 40 },
            { hotmart_id: 'PROD131', name: 'Finanças Pessoais', niche: 'Finance', price: 147.00, commission_rate: 40 },
            { hotmart_id: 'PROD132', name: 'Design Gráfico', niche: 'Design', price: 197.00, commission_rate: 40 },
            { hotmart_id: 'PROD133', name: 'Fotografia Profissional', niche: 'Photography', price: 247.00, commission_rate: 40 },
            { hotmart_id: 'PROD134', name: 'Redação ENEM', niche: 'Education', price: 97.00, commission_rate: 40 },
            { hotmart_id: 'PROD135', name: 'Investimentos Bolsa', niche: 'Finance', price: 397.00, commission_rate: 40 },
            { hotmart_id: 'PROD136', name: 'Corte de Cabelho', niche: 'Beauty', price: 167.00, commission_rate: 40 },
            { hotmart_id: 'PROD137', name: 'Edição de Vídeo', niche: 'Technology', price: 147.00, commission_rate: 40 },
            { hotmart_id: 'PROD138', name: 'Curso de Inglês', niche: 'Education', price: 197.00, commission_rate: 40 },
            { hotmart_id: 'PROD139', name: 'Marketing Digital Avançado', niche: 'Marketing', price: 497.00, commission_rate: 40 },
            { hotmart_id: 'PROD140', name: 'Yoga Intermediário', niche: 'Health', price: 87.00, commission_rate: 40 },
            { hotmart_id: 'PROD141', name: 'Programação Web', niche: 'Technology', price: 347.00, commission_rate: 40 },
            { hotmart_id: 'PROD142', name: 'Confeitaria artesanal', niche: 'Food', price: 127.00, commission_rate: 40 }
        ];
        
        try {
            const pool = new Pool({
                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                password: process.env.DB_PASSWORD,
                port: 5432,
            });
            
            let insertedCount = 0;
            
            // Process in batches of 20
            for (let i = 0; i < mockProducts.length; i += 20) {
                const batch = mockProducts.slice(i, i + 20);
                console.log(`📦 Processing batch ${Math.floor(i/20) + 1}: ${batch.length} products`);
                
                for (const product of batch) {
                    try {
                        // Check if product already exists
                        const existsResult = await pool.query(
                            'SELECT id FROM products WHERE hotmart_id = $1',
                            [product.hotmart_id]
                        );
                        
                        if (existsResult.rows.length === 0) {
                            // Insert new product
                            await pool.query(`
                                INSERT INTO products (hotmart_id, name, niche, url_sales_page, status, price, commission_rate, selected_for_tracking)
                                VALUES ($1, $2, $3, $4, $5, $6, $7)
                            `, [
                                product.hotmart_id,
                                product.name,
                                product.niche,
                                `https://hotmart.com/${product.hotmart_id}`,
                                'tracking',
                                product.price,
                                product.commission_rate,
                                false // Not selected by default
                            ]);
                            
                            insertedCount++;
                        }
                    } catch (error) {
                        console.error(`Error inserting product ${product.hotmart_id}:`, error.message);
                    }
                }
                
                // Add delay between batches to avoid overwhelming
                if (i + 20 < mockProducts.length) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            
            await pool.end();
            
            const result = {
                status: 'success',
                message: `Market scan completed. ${insertedCount} new products added to database.`,
                total_processed: mockProducts.length,
                new_products: insertedCount,
                batches_processed: Math.ceil(mockProducts.length / 20)
            };
            
            console.log('✅', result.message);
            return result;
            
        } catch (error) {
            console.error('❌ Market scan failed:', error);
            return {
                status: 'error',
                message: `Market scan failed: ${error.message}`,
                error: error.message
            };
        }
    },
    
    checkUrl: async function(url) {
        try {
            if (!this.browser) {
                this.browser = await launch({ 
                    headless: 'new'
                });
            }
            
            const page = await this.browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            const title = await page.title();
            await page.close();
            return { success: true, title };
        } catch (error) {
            console.error('DetectorAgent error:', error);
            return { success: false, error: error.message };
        }
    }
};

export default DetectorAgent;
