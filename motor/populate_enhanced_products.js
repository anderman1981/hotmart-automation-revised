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

// Enhanced products with better data for improved UI
const enhancedProducts = [
    {
        hotmart_id: 'HM-MKT2024A',
        name: 'Marketing Digital: De Cero a Experto',
        description: 'El curso más completo de marketing digital 2024. Aprende SEO, SEM, redes sociales, email marketing y automatización con casos reales.',
        niche: 'Marketing',
        price: 297.00,
        commission_rate: 40.00,
        rating: 4.8,
        students: 15420,
        url_sales_page: 'https://pay.hotmart.com/MKT2024A',
        product_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        instructor: 'Carlos Rodríguez',
        duration: '32 horas',
        level: 'Intermedio',
        certificate: true,
        support: true,
        warranty_days: 30,
        languages: ['Español', 'Inglés'],
        target_audience: ['Emprendedores', 'Marketing managers', 'Freelancers'],
        topics: ['SEO', 'Google Ads', 'Social Media', 'Email Marketing', 'Analytics'],
        highlights: ['Certificado incluido', 'Casos reales', 'Soporte directo', 'Actualizaciones gratis'],
        recent_sales: 234,
        conversion_rate: 3.2,
        promotional_price: 197.00,
        status: 'active',
        performance_score: 85.5
    },
    {
        hotmart_id: 'HM-JS2024B',
        name: 'JavaScript Full Stack 2024',
        description: 'Domina JavaScript desde los fundamentos hasta creación de aplicaciones completas. React, Node.js, bases de datos y deployment.',
        niche: 'Technology',
        price: 397.00,
        commission_rate: 45.00,
        rating: 4.9,
        students: 12350,
        url_sales_page: 'https://pay.hotmart.com/JS2024B',
        product_image: 'https://images.unsplash.com/photo-1579403124614-197f69d8187b?w=400',
        instructor: 'María González',
        duration: '48 horas',
        level: 'Principiante-Intermedio',
        certificate: true,
        support: true,
        warranty_days: 45,
        languages: ['Español'],
        target_audience: ['Desarrolladores web', 'Programadores junior', 'Estudiantes'],
        topics: ['JavaScript ES6+', 'React', 'Node.js', 'MongoDB', 'Deployment'],
        highlights: ['Proyectos reales', 'Mentoría personal', 'Comunidad activa', 'Certificado'],
        recent_sales: 189,
        conversion_rate: 4.1,
        promotional_price: 297.00,
        status: 'active',
        performance_score: 92.3
    },
    {
        hotmart_id: 'HM-TRD2024C',
        name: 'Trading Profesional de Criptomonedas',
        description: 'Estrategias probadas para operar criptomonedas. Análisis técnico, gestión de riesgo y psicología del trading.',
        niche: 'Finance',
        price: 597.00,
        commission_rate: 50.00,
        rating: 4.7,
        students: 8920,
        url_sales_page: 'https://pay.hotmart.com/TRD2024C',
        product_image: 'https://images.unsplash.com/photo-1629227189863-f4c4fd26f4ac?w=400',
        instructor: 'Roberto Silva',
        duration: '24 horas',
        level: 'Avanzado',
        certificate: true,
        support: true,
        warranty_days: 60,
        languages: ['Español', 'Portugués'],
        target_audience: ['Traders', 'Inversionistas', 'Analistas financieros'],
        topics: ['Análisis técnico', 'Trading bots', 'Gestión de riesgo', 'DeFi'],
        highlights: ['Señales diarias', 'Grupo VIP', 'Backtesting', 'Mentoría 1-1'],
        recent_sales: 156,
        conversion_rate: 2.8,
        promotional_price: 397.00,
        status: 'testing',
        performance_score: 78.2
    },
    {
        hotmart_id: 'HM-YOGA2024D',
        name: 'Yoga y Mindfulness Integral',
        description: 'Transforma tu vida con yoga, meditación y técnicas de respiración. Para todos los niveles, enfocado en bienestar total.',
        niche: 'Health',
        price: 147.00,
        commission_rate: 35.00,
        rating: 4.9,
        students: 22150,
        url_sales_page: 'https://pay.hotmart.com/YOGA2024D',
        product_image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
        instructor: 'Ana Martínez',
        duration: '20 horas',
        level: 'Todos los niveles',
        certificate: true,
        support: true,
        warranty_days: 30,
        languages: ['Español'],
        target_audience: ['Principiantes', 'Profesionales', 'Personas con estrés'],
        topics: ['Hatha Yoga', 'Meditación', 'Respiración', 'Mindfulness'],
        highlights: ['Clases en vivo', 'App móvil', 'Comunidad', 'Certificación'],
        recent_sales: 412,
        conversion_rate: 5.2,
        promotional_price: 97.00,
        status: 'active',
        performance_score: 94.7
    },
    {
        hotmart_id: 'HM-ECOM2024E',
        name: 'E-commerce Exitoso desde Casa',
        description: 'Crea y escala tu tienda online. Productos ganadores, marketing digital, logística y automatización.',
        niche: 'Business',
        price: 497.00,
        commission_rate: 40.00,
        rating: 4.6,
        students: 9870,
        url_sales_page: 'https://pay.hotmart.com/ECOM2024E',
        product_image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
        instructor: 'Luis Fernández',
        duration: '28 horas',
        level: 'Principiante-Intermedio',
        certificate: true,
        support: true,
        warranty_days: 45,
        languages: ['Español'],
        target_audience: ['Emprendedores', 'Pequeños negocios', 'Marketers'],
        topics: ['Shopify', 'Marketing digital', 'Logística', 'Customer service'],
        highlights: ['Plantillas incluidas', 'Casos de éxito', 'Soporte técnico', 'Actualizaciones'],
        recent_sales: 178,
        conversion_rate: 3.6,
        promotional_price: 347.00,
        status: 'active',
        performance_score: 81.9
    },
    {
        hotmart_id: 'HM-INGL2024F',
        name: 'Inglés Conversacional Fluído 90 días',
        description: 'Método revolucionario para hablar inglés con confianza en 90 días. Enfoque práctico sin memorización.',
        niche: 'Education',
        price: 297.00,
        commission_rate: 40.00,
        rating: 4.8,
        students: 18670,
        url_sales_page: 'https://pay.hotmart.com/INGL2024F',
        product_image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400',
        instructor: 'Jennifer Brown',
        duration: '36 horas',
        level: 'Intermedio',
        certificate: true,
        support: true,
        warranty_days: 30,
        languages: ['Español', 'Inglés'],
        target_audience: ['Profesionales', 'Estudiantes', 'Viajeros'],
        topics: ['Speaking', 'Listening', 'Pronunciation', 'Business English'],
        highlights: ['Clases conversación', 'App práctica', 'Certificado TOEFL', 'Native speakers'],
        recent_sales: 289,
        conversion_rate: 4.3,
        promotional_price: 197.00,
        status: 'testing',
        performance_score: 87.1
    },
    {
        hotmart_id: 'HM-MUSIC2024G',
        name: 'Producción Musical con Ableton Live',
        description: 'Crea música profesional. Desde composición hasta masterización. Electrónica, pop, hip-hop y más.',
        niche: 'Music',
        price: 347.00,
        commission_rate: 35.00,
        rating: 4.7,
        students: 7450,
        url_sales_page: 'https://pay.hotmart.com/MUSIC2024G',
        product_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        instructor: 'DJ Matrix',
        duration: '30 horas',
        level: 'Intermedio-Avanzado',
        certificate: true,
        support: true,
        warranty_days: 30,
        languages: ['Español'],
        target_audience: ['Productores musicales', 'DJs', 'Músicos'],
        topics: ['Ableton Live', 'Music theory', 'Mixing', 'Mastering'],
        highlights: ['Project files', 'Sample packs', 'Feedback personal', 'Studio sessions'],
        recent_sales: 134,
        conversion_rate: 3.1,
        promotional_price: 247.00,
        status: 'cold',
        performance_score: 45.3,
        cold_moved_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        hotmart_id: 'HM-COACH2024H',
        name: 'Coaching de Carrera y Liderazgo',
        description: 'Transforma tu carrera profesional. Estrategias de liderazgo, negociación y desarrollo personal.',
        niche: 'Business',
        price: 597.00,
        commission_rate: 45.00,
        rating: 4.9,
        students: 11230,
        url_sales_page: 'https://pay.hotmart.com/COACH2024H',
        product_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
        instructor: 'Patricia Wong',
        duration: '24 horas',
        level: 'Intermedio-Avanzado',
        certificate: true,
        support: true,
        warranty_days: 60,
        languages: ['Español', 'Inglés'],
        target_audience: ['Profesionales', 'Managers', 'Empresarios'],
        topics: ['Leadership', 'Career development', 'Networking', 'Personal branding'],
        highlights: ['Mentoría personal', 'Networking VIP', 'Certificación internacional', 'Executive coaching'],
        recent_sales: 198,
        conversion_rate: 4.7,
        promotional_price: 447.00,
        status: 'active',
        performance_score: 89.4
    },
    {
        hotmart_id: 'HM-UXUI2024I',
        name: 'Diseño UX/UI Apps Móviles Pro',
        description: 'Diseña interfaces excepcionales para apps móviles. Figma, prototipado, testing y portfolio profesional.',
        niche: 'Design',
        price: 447.00,
        commission_rate: 40.00,
        rating: 4.8,
        students: 8950,
        url_sales_page: 'https://pay.hotmart.com/UXUI2024I',
        product_image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400',
        instructor: 'Sofia Kim',
        duration: '35 horas',
        level: 'Intermedio',
        certificate: true,
        support: true,
        warranty_days: 45,
        languages: ['Español', 'Inglés'],
        target_audience: ['Diseñadores', 'Desarrolladores', 'Product managers'],
        topics: ['Figma', 'Prototyping', 'User research', 'Mobile design'],
        highlights: ['Portfolio projects', 'Design systems', 'User testing', 'Industry mentors'],
        recent_sales: 167,
        conversion_rate: 3.9,
        promotional_price: 347.00,
        status: 'active',
        performance_score: 86.2
    },
    {
        hotmart_id: 'HM-CRYPTO2024J',
        name: 'Blockchain y Smart Contracts',
        description: 'Programa en blockchain desde cero. Crea smart contracts, DApps y entiende el mundo Web3.',
        niche: 'Technology',
        price: 697.00,
        commission_rate: 50.00,
        rating: 4.7,
        students: 6230,
        url_sales_page: 'https://pay.hotmart.com/CRYPTO2024J',
        product_image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
        instructor: 'Alex Chen',
        duration: '42 horas',
        level: 'Avanzado',
        certificate: true,
        support: true,
        warranty_days: 60,
        languages: ['Español', 'Inglés'],
        target_audience: ['Desarrolladores', 'Blockchain enthusiasts', 'Tech professionals'],
        topics: ['Solidity', 'Ethereum', 'Smart Contracts', 'DeFi', 'Web3'],
        highlights: ['Real projects', 'Testnet access', 'Developer community', 'Job placement'],
        recent_sales: 98,
        conversion_rate: 2.3,
        promotional_price: 497.00,
        status: 'testing',
        performance_score: 72.8
    },
    {
        hotmart_id: 'HM-NUTRI2024K',
        name: 'Nutrición Deportiva Avanzada',
        description: 'Optimiza tu rendimiento deportivo con nutrición científica. Planes personalizados y suplementación profesional.',
        niche: 'Health',
        price: 247.00,
        commission_rate: 35.00,
        rating: 4.8,
        students: 13980,
        url_sales_page: 'https://pay.hotmart.com/NUTRI2024K',
        product_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        instructor: 'Dr. Miguel Torres',
        duration: '18 horas',
        level: 'Intermedio',
        certificate: true,
        support: true,
        warranty_days: 30,
        languages: ['Español'],
        target_audience: ['Atletas', 'Entrenadores', 'Entusiastas del fitness'],
        topics: ['Sports nutrition', 'Supplements', 'Meal planning', 'Performance optimization'],
        highlights: ['Medical supervision', 'Personalized plans', 'Science-based', 'Community support'],
        recent_sales: 312,
        conversion_rate: 4.8,
        promotional_price: 167.00,
        status: 'active',
        performance_score: 90.1
    },
    {
        hotmart_id: 'HM-COPY2024L',
        name: 'Copywriting que Vende Millones',
        description: 'Escribe textos que convierten. Persuasión, psicología del consumidor y estrategias de marketing directo.',
        niche: 'Marketing',
        price: 397.00,
        commission_rate: 45.00,
        rating: 4.6,
        students: 10560,
        url_sales_page: 'https://pay.hotmart.com/COPY2024L',
        product_image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
        instructor: 'Roberto García',
        duration: '26 horas',
        level: 'Intermedio',
        certificate: true,
        support: true,
        warranty_days: 45,
        languages: ['Español'],
        target_audience: ['Copywriters', 'Marketers', 'Emprendedores'],
        topics: ['Persuasive writing', 'Sales funnels', 'Email marketing', 'Content strategy'],
        highlights: ['Real campaigns', 'Template library', 'Feedback sessions', 'Certification'],
        recent_sales: 223,
        conversion_rate: 4.2,
        promotional_price: 297.00,
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
        
        // Insert enhanced products using only basic columns
        console.log(`🚀 Adding ${enhancedProducts.length} enhanced products...`);
        
        let addedCount = 0;
        
        for (const product of enhancedProducts) {
            try {
                const result = await pool.query(`
                    INSERT INTO products (
                        hotmart_id, name, description, niche, price, commission_rate,
                        url_sales_page, product_image, product_image_alt, instructor, 
                        duration, level, certificate, support, warranty_days, languages, 
                        target_audience, topics, highlights, recent_sales, conversion_rate, 
                        promotional_price, status, performance_score, cold_moved_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
                        $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
                    ) RETURNING id
                `, [
                    product.hotmart_id,
                    product.name,
                    product.description,
                    product.niche,
                    product.price,
                    product.commission_rate,
                    product.url_sales_page,
                    product.product_image,
                    `${product.name} - Curso premium`,
                    product.instructor,
                    product.duration,
                    product.level,
                    product.certificate,
                    product.support,
                    product.warranty_days,
                    product.languages,
                    product.target_audience,
                    product.topics,
                    product.highlights,
                    product.recent_sales,
                    product.conversion_rate,
                    product.promotional_price,
                    product.status,
                    product.performance_score,
                    product.cold_moved_at || null
                ]);
                
                addedCount++;
                console.log(`✅ Added: ${product.name} (ID: ${result.rows[0].id})`);
                
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