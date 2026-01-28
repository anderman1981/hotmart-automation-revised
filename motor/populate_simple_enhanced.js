import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// Enhanced products with better data but using only basic columns
const enhancedProducts = [
    {
        hotmart_id: 'HM-MKT2024A',
        name: 'Marketing Digital: De Cero a Experto',
        description: 'El curso más completo de marketing digital 2024. Aprende SEO, SEM, redes sociales, email marketing y automatización con casos reales.',
        niche: 'Marketing',
        url_sales_page: 'https://pay.hotmart.com/MKT2024A',
        status: 'active',
        performance_score: 85.5
    },
    {
        hotmart_id: 'HM-JS2024B',
        name: 'JavaScript Full Stack 2024',
        description: 'Domina JavaScript desde los fundamentos hasta creación de aplicaciones completas. React, Node.js, bases de datos y deployment.',
        niche: 'Technology',
        url_sales_page: 'https://pay.hotmart.com/JS2024B',
        status: 'active',
        performance_score: 92.3
    },
    {
        hotmart_id: 'HM-TRD2024C',
        name: 'Trading Profesional de Criptomonedas',
        description: 'Estrategias probadas para operar criptomonedas. Análisis técnico, gestión de riesgo y psicología del trading.',
        niche: 'Finance',
        url_sales_page: 'https://pay.hotmart.com/TRD2024C',
        status: 'testing',
        performance_score: 78.2
    },
    {
        hotmart_id: 'HM-YOGA2024D',
        name: 'Yoga y Mindfulness Integral',
        description: 'Transforma tu vida con yoga, meditación y técnicas de respiración. Para todos los niveles, enfocado en bienestar total.',
        niche: 'Health',
        url_sales_page: 'https://pay.hotmart.com/YOGA2024D',
        status: 'active',
        performance_score: 94.7
    },
    {
        hotmart_id: 'HM-ECOM2024E',
        name: 'E-commerce Exitoso desde Casa',
        description: 'Crea y escala tu tienda online. Productos ganadores, marketing digital, logística y automatización.',
        niche: 'Business',
        url_sales_page: 'https://pay.hotmart.com/ECOM2024E',
        status: 'active',
        performance_score: 81.9
    },
    {
        hotmart_id: 'HM-INGL2024F',
        name: 'Inglés Conversacional Fluído 90 días',
        description: 'Método revolucionario para hablar inglés con confianza en 90 días. Enfoque práctico sin memorización.',
        niche: 'Education',
        url_sales_page: 'https://pay.hotmart.com/INGL2024F',
        status: 'testing',
        performance_score: 87.1
    },
    {
        hotmart_id: 'HM-MUSIC2024G',
        name: 'Producción Musical con Ableton Live',
        description: 'Crea música profesional. Desde composición hasta masterización. Electrónica, pop, hip-hop y más.',
        niche: 'Music',
        url_sales_page: 'https://pay.hotmart.com/MUSIC2024G',
        status: 'cold',
        performance_score: 45.3
    },
    {
        hotmart_id: 'HM-COACH2024H',
        name: 'Coaching de Carrera y Liderazgo',
        description: 'Transforma tu carrera profesional. Estrategias de liderazgo, negociación y desarrollo personal.',
        niche: 'Business',
        url_sales_page: 'https://pay.hotmart.com/COACH2024H',
        status: 'active',
        performance_score: 89.4
    },
    {
        hotmart_id: 'HM-UXUI2024I',
        name: 'Diseño UX/UI Apps Móviles Pro',
        description: 'Diseña interfaces excepcionales para apps móviles. Figma, prototipado, testing y portfolio profesional.',
        niche: 'Design',
        url_sales_page: 'https://pay.hotmart.com/UXUI2024I',
        status: 'active',
        performance_score: 86.2
    },
    {
        hotmart_id: 'HM-CRYPTO2024J',
        name: 'Blockchain y Smart Contracts',
        description: 'Programa en blockchain desde cero. Crea smart contracts, DApps y entiende el mundo Web3.',
        niche: 'Technology',
        url_sales_page: 'https://pay.hotmart.com/CRYPTO2024J',
        status: 'testing',
        performance_score: 72.8
    },
    {
        hotmart_id: 'HM-NUTRI2024K',
        name: 'Nutrición Deportiva Avanzada',
        description: 'Optimiza tu rendimiento deportivo con nutrición científica. Planes personalizados y suplementación profesional.',
        niche: 'Health',
        url_sales_page: 'https://pay.hotmart.com/NUTRI2024K',
        status: 'active',
        performance_score: 90.1
    },
    {
        hotmart_id: 'HM-COPY2024L',
        name: 'Copywriting que Vende Millones',
        description: 'Escribe textos que convierten. Persuasión, psicología del consumidor y estrategias de marketing directo.',
        niche: 'Marketing',
        url_sales_page: 'https://pay.hotmart.com/COPY2024L',
        status: 'active',
        performance_score: 84.6
    }
];

async function clearAndPopulateProducts() {
    console.log('🗑️  Clearing all products from database...');
    
    try {
        // Clear existing products
        await pool.query('DELETE FROM products');
        console.log('✅ All products cleared successfully');
        
        // Insert enhanced products
        console.log(`🚀 Adding ${enhancedProducts.length} enhanced products...`);
        
        let addedCount = 0;
        
        for (const product of enhancedProducts) {
            try {
                const result = await pool.query(`
                    INSERT INTO products (hotmart_id, name, description, niche, url_sales_page, status, affiliate_commission, performance_score)
                    VALUES ($1, $2, $3, $4, $5, $6, 40.0, $7)
                    RETURNING id
                `, [
                    product.hotmart_id,
                    product.name,
                    product.description,
                    product.niche,
                    product.url_sales_page,
                    product.status,
                    product.performance_score
                ]);
                
                addedCount++;
                console.log(`✅ Added: ${product.name} (ID: ${result.rows[0].id})`);
                
                // If product is cold, set cold_moved_at
                if (product.status === 'cold') {
                    await pool.query(`
                        UPDATE products 
                        SET cold_moved_at = $1 
                        WHERE id = $2
                    `, [new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), result.rows[0].id]);
                }
                
            } catch (error) {
                console.error(`❌ Error adding ${product.name}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Population completed! Added ${addedCount} new products.`);
        
        // Get total count and summary
        const countResult = await pool.query('SELECT COUNT(*) FROM products');
        const statusSummary = await pool.query('SELECT status, COUNT(*) FROM products GROUP BY status');
        const nicheSummary = await pool.query('SELECT niche, COUNT(*) FROM products GROUP BY niche ORDER BY COUNT(*) DESC');
        
        console.log(`📊 Total products in database: ${countResult.rows[0].count}`);
        console.log('\n📈 Products by status:');
        statusSummary.rows.forEach(row => {
            console.log(`   ${row.status}: ${row.count}`);
        });
        console.log('\n🎯 Products by niche:');
        nicheSummary.rows.forEach(row => {
            console.log(`   ${row.niche}: ${row.count}`);
        });
        
    } catch (error) {
        console.error('❌ Operation failed:', error);
    } finally {
        await pool.end();
    }
}

clearAndPopulateProducts();