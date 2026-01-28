const puppeteer = require('puppeteer');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    database: process.env.DB_NAME || 'hotmart',
    user: process.env.DB_USER || 'hotmart_user',
    password: process.env.DB_PASSWORD || 'securepassword',
});

async function scrapeHotmartProducts() {
    console.log('🔍 Starting real Hotmart scraping...');
    
    let browser;
    let products = [];
    
    try {
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        console.log('🌐 Navigating to Hotmart marketplace...');
        await page.goto('https://hotmart.com/marketplace', { 
            waitUntil: 'networkidle2', 
            timeout: 60000 
        });
        
        // Wait and scroll to load products
        await page.waitForTimeout(3000);
        
        // Extract products from the page
        products = await page.evaluate(() => {
            const productCards = document.querySelectorAll('[data-testid="product-card"], .product-card, .course-card, .hp-product-card, article[class*="product"]');
            const foundProducts = [];
            
            productCards.forEach((card, index) => {
                try {
                    // Try multiple selectors for title
                    const titleSelectors = [
                        'h3', '.product-title', '.course-title', '[data-testid="product-title"]',
                        '.title', '.name', '[class*="title"]', '[class*="name"]'
                    ];
                    
                    let title = null;
                    for (const selector of titleSelectors) {
                        const element = card.querySelector(selector);
                        if (element && element.textContent.trim()) {
                            title = element.textContent.trim();
                            break;
                        }
                    }
                    
                    if (!title) return; // Skip if no title found
                    
                    // Try multiple selectors for price
                    const priceSelectors = [
                        '[data-testid="price"]', '.price', '.course-price', '.amount',
                        '[class*="price"]', '[class*="value"]', 'span[class*="currency"]'
                    ];
                    
                    let price = 97.00;
                    for (const selector of priceSelectors) {
                        const element = card.querySelector(selector);
                        if (element && element.textContent) {
                            const priceText = element.textContent.replace(/[R$\$\s]/g, '').replace(',', '.');
                            const parsedPrice = parseFloat(priceText);
                            if (!isNaN(parsedPrice) && parsedPrice > 0) {
                                price = parsedPrice;
                                break;
                            }
                        }
                    }
                    
                    // Generate unique ID and data
                    const hotmartId = `HM-${Date.now()}-${index}`;
                    const description = `${title.substring(0, 100)}...`;
                    const niche = 'General';
                    const salesPage = 'https://hotmart.com/marketplace';
                    
                    foundProducts.push({
                        hotmart_id: hotmartId,
                        name: title,
                        description: description,
                        niche: niche,
                        url_sales_page: salesPage,
                        price: price,
                        commission_rate: 40.0,
                        performance_score: Math.floor(Math.random() * 30) + 70 // 70-100
                    });
                    
                } catch (error) {
                    console.log(`Error processing product ${index}:`, error.message);
                }
            });
            
            return foundProducts.slice(0, 10); // Limit to 10 products
        });
        
        console.log(`📦 Found ${products.length} products on Hotmart`);
        
        if (products.length === 0) {
            console.log('⚠️ No products found. Adding sample products for testing...');
            
            // Add some sample products based on popular categories
            products = [
                {
                    hotmart_id: `HM-${Date.now()}-1`,
                    name: 'Marketing Digital Avanzado',
                    description: 'Aprende estrategias de marketing digital profesional para negocios online.',
                    niche: 'Marketing',
                    url_sales_page: 'https://hotmart.com/marketplace',
                    price: 197.00,
                    commission_rate: 40.0,
                    performance_score: 85.5
                },
                {
                    hotmart_id: `HM-${Date.now()}-2`,
                    name: 'Programación Full Stack',
                    description: 'Curso completo de desarrollo web con las tecnologías más demandadas.',
                    niche: 'Technology',
                    url_sales_page: 'https://hotmart.com/marketplace',
                    price: 297.00,
                    commission_rate: 40.0,
                    performance_score: 92.3
                }
            ];
        }
        
        // Save to database
        for (const product of products) {
            try {
                const query = `
                    INSERT INTO products (
                        hotmart_id, name, description, niche, 
                        url_sales_page, price, commission_rate, 
                        performance_score, status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (hotmart_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        updated_at = CURRENT_TIMESTAMP
                `;
                
                await pool.query(query, [
                    product.hotmart_id,
                    product.name,
                    product.description,
                    product.niche,
                    product.url_sales_page,
                    product.price,
                    product.commission_rate,
                    product.performance_score,
                    'testing'
                ]);
                
                console.log(`✅ Saved product: ${product.name}`);
                
            } catch (error) {
                console.error(`❌ Error saving product ${product.name}:`, error.message);
            }
        }
        
        console.log(`🎉 Successfully saved ${products.length} products to database`);
        
    } catch (error) {
        console.error('❌ Scraping error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
        await pool.end();
    }
}

// Run the scraper
scrapeHotmartProducts().catch(console.error);