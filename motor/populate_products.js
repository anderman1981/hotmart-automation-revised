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

const additionalProducts = [
    {
        hotmart_id: 'HM-R88776655A',
        name: 'Marketing Digital Avanzado 2024',
        description: 'Curso completo de marketing digital con estrategias avanzadas SEO, SEM, redes sociales y automatización.',
        niche: 'Marketing',
        url_sales_page: 'https://pay.hotmart.com/R88776655A'
    },
    {
        hotmart_id: 'HM-S77665544B',
        name: 'JavaScript Moderno y React',
        description: 'Aprende JavaScript ES6+ y React desde cero. Proyectos reales y mejores prácticas.',
        niche: 'Technology',
        url_sales_page: 'https://pay.hotmart.com/S77665544B'
    },
    {
        hotmart_id: 'HM-T66554433C',
        name: 'Inversiones en Bolsa para Principiantes',
        description: 'Guía completa para empezar a invertir en bolsa con estrategias probadas y gestión de riesgo.',
        niche: 'Finance',
        url_sales_page: 'https://pay.hotmart.com/T66554433C'
    },
    {
        hotmart_id: 'HM-U55443322D',
        name: 'Yoga y Meditación para Reducir Estrés',
        description: 'Programa integral de yoga y meditación para reducir el estrés y mejorar el bienestar mental.',
        niche: 'Health',
        url_sales_page: 'https://pay.hotmart.com/U55443322D'
    },
    {
        hotmart_id: 'HM-V44332211E',
        name: 'Fotografía Profesional con Smartphone',
        description: 'Domina la fotografía profesional usando solo tu smartphone. Técnicas de composición y edición.',
        niche: 'Creative',
        url_sales_page: 'https://pay.hotmart.com/V44332211E'
    },
    {
        hotmart_id: 'HM-W33221100F',
        name: 'Negocio de E-commerce desde Casa',
        description: 'Monta tu negocio online desde casa. Productos ganadores, marketing y logística.',
        niche: 'Business',
        url_sales_page: 'https://pay.hotmart.com/W33221100F'
    },
    {
        hotmart_id: 'HM-X22119988G',
        name: 'Inglés Conversacional Fluído',
        description: 'Metodología revolucionaria para hablar inglés con fluidez y confianza en 90 días.',
        niche: 'Education',
        url_sales_page: 'https://pay.hotmart.com/X22119988G'
    },
    {
        hotmart_id: 'HM-Y11008877H',
        name: 'Producción Musical con Ableton Live',
        description: 'Crea música profesional con Ableton Live. Desde composición hasta masterización.',
        niche: 'Music',
        url_sales_page: 'https://pay.hotmart.com/Y11008877H'
    },
    {
        hotmart_id: 'HM-Z00997766I',
        name: 'Consultoría de Carrera Profissional',
        description: 'Transforma tu carrera profesional con coaching especializado y estrategias de desarrollo.',
        niche: 'Business',
        url_sales_page: 'https://pay.hotmart.com/Z00997766I'
    },
    {
        hotmart_id: 'HM-A99887755J',
        name: 'Diseño UX/UI para Aplicaciones Móviles',
        description: 'Diseña interfaces excepcionales para apps móviles. Figma, prototipado y testing.',
        niche: 'Design',
        url_sales_page: 'https://pay.hotmart.com/A99887755J'
    },
    {
        hotmart_id: 'HM-B88776644K',
        name: 'Trading de Criptomonedas Avanzado',
        description: 'Estrategias avanzadas de trading crypto. Análisis técnico, gestión de portafolio y arbitraje.',
        niche: 'Finance',
        url_sales_page: 'https://pay.hotmart.com/B88776644K'
    },
    {
        hotmart_id: 'HM-C77665533L',
        name: 'Nutrición Deportiva Optimizada',
        description: 'Planes nutricionales personalizados para deportistas. Suplementación y rendimiento.',
        niche: 'Health',
        url_sales_page: 'https://pay.hotmart.com/C77665533L'
    },
    {
        hotmart_id: 'HM-D66554422M',
        name: 'Copywriting Persuasivo para Ventas',
        description: 'Escribe textos que venden. Técnicas de copywriting para marketing y ventas.',
        niche: 'Marketing',
        url_sales_page: 'https://pay.hotmart.com/D66554422M'
    }
];

async function populateProducts() {
    console.log('🚀 Adding 13 additional products...');
    
    try {
        let addedCount = 0;
        
        for (const product of additionalProducts) {
            try {
                // Check if product already exists
                const existsResult = await pool.query(
                    'SELECT id FROM products WHERE hotmart_id = $1',
                    [product.hotmart_id]
                );
                
                if (existsResult.rows.length === 0) {
                    // Insert new product
                    await pool.query(`
                        INSERT INTO products (hotmart_id, name, description, niche, url_sales_page, status, affiliate_commission, performance_score)
                        VALUES ($1, $2, $3, $4, $5, 'testing', 40.0, 75.0)
                    `, [
                        product.hotmart_id,
                        product.name,
                        product.description,
                        product.niche,
                        product.url_sales_page
                    ]);
                    
                    addedCount++;
                    console.log(`✅ Added: ${product.name}`);
                } else {
                    console.log(`⚠️  Already exists: ${product.name}`);
                }
            } catch (error) {
                console.error(`❌ Error adding ${product.name}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Completed! Added ${addedCount} new products.`);
        
        // Get total count
        const countResult = await pool.query('SELECT COUNT(*) FROM products');
        console.log(`📊 Total products in database: ${countResult.rows[0].count}`);
        
    } catch (error) {
        console.error('❌ Population failed:', error);
    } finally {
        await pool.end();
    }
}

populateProducts();