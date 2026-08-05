const { Pool } = require('pg');
const ContentAgent = require('./ContentAgent');

class SuperScrapingAgent {
    constructor() {
        this.name = 'SuperScrapingAgent';
        this.contentAgent = new ContentAgent();
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: 5432,
        });
    }

    async executeGlobalScan(maxProducts = 50) {
        console.log(`🚀 ${this.name}: Iniciando Global Scan completo...`);
        
        // Add timeout and error handling
        const SCAN_TIMEOUT = 120000; // 2 minutes timeout
        const PHASE_TIMEOUT = 30000; // 30 seconds per phase
        let scanStartTime = Date.now();
        
        try {
            // Check overall timeout
            if (Date.now() - scanStartTime > SCAN_TIMEOUT) {
                throw new Error('Global scan timeout exceeded');
            }
            
            // 1. Fase de Scraping Inteligente with timeout
            console.log(`📍 Phase 1: Scraping (max ${PHASE_TIMEOUT}ms)`);
            const scrapedProducts = await Promise.race([
                this.intelligentScraping(maxProducts),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Scraping phase timeout')), PHASE_TIMEOUT)
                )
            ]);
            console.log(`📦 Scraped ${scrapedProducts.length} productos`);
            
            // Check timeout after phase 1
            if (Date.now() - scanStartTime > SCAN_TIMEOUT) {
                throw new Error('Global scan timeout after scraping phase');
            }
            
            // 2. Fase de Análisis de Viabilidad con LLM with timeout
            console.log(`📍 Phase 2: Analysis (max ${PHASE_TIMEOUT}ms)`);
            const analyzedProducts = await Promise.race([
                this.analyzeViability(scrapedProducts),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Analysis phase timeout')), PHASE_TIMEOUT)
                )
            ]);
            console.log(`📊 Analizados ${analyzedProducts.length} productos para viabilidad`);
            
            // Check timeout after phase 2
            if (Date.now() - scanStartTime > SCAN_TIMEOUT) {
                throw new Error('Global scan timeout after analysis phase');
            }
            
            // 3. Fase de Decisión de Afiliación with timeout
            console.log(`📍 Phase 3: Affiliate Decisions (max ${PHASE_TIMEOUT}ms)`);
            const affiliateDecisions = await Promise.race([
                this.makeAffiliateDecisions(analyzedProducts),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Affiliate decisions phase timeout')), PHASE_TIMEOUT)
                )
            ]);
            console.log(`🤖 Tomadas ${affiliateDecisions.length} decisiones de afiliación`);
            
            // Check timeout after phase 3
            if (Date.now() - scanStartTime > SCAN_TIMEOUT) {
                throw new Error('Global scan timeout after affiliate decisions phase');
            }
            
            // 4. Fase de Extracción de Data para Contenidos with timeout
            console.log(`📍 Phase 4: Content Data Extraction (max ${PHASE_TIMEOUT}ms)`);
            const contentData = await Promise.race([
                this.extractContentData(affiliateDecisions),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Content data extraction timeout')), PHASE_TIMEOUT)
                )
            ]);
            console.log(`📝 Extraída data de contenido para ${contentData.length} productos`);
            
            // 5. Activar siguiente agente en la cadena with timeout
            console.log(`📍 Phase 5: Content Agent Activation (max ${PHASE_TIMEOUT}ms)`);
            await Promise.race([
                this.activateContentAgent(contentData),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Content agent activation timeout')), PHASE_TIMEOUT)
                )
            ]);
            
            const totalScanTime = Date.now() - scanStartTime;
            console.log(`✅ Global Scan completed in ${totalScanTime}ms`);
            
            return {
                success: true,
                scraped: scrapedProducts.length,
                analyzed: analyzedProducts.length,
                approved: affiliateDecisions.length,
                content_ready: contentData.length,
                scan_time_ms: totalScanTime
            };
            
        } catch (error) {
            const totalScanTime = Date.now() - scanStartTime;
            console.error(`❌ ${this.name} Error after ${totalScanTime}ms:`, error);
            return { 
                success: false, 
                error: error.message,
                scan_time_ms: totalScanTime
            };
        }
    }

    async intelligentScraping(maxProducts) {
        console.log(`🔍 ${this.name}: Iniciando scraping inteligente...`);
        
        // Usar el DetectorAgent existente pero con parámetros mejorados
        const DetectorAgent = require('./DetectorAgent');
        const detector = new DetectorAgent();
        
        // Configurar scraping con métricas preestablecidas
        const scrapingConfig = {
            maxProducts: maxProducts,
            niches: ['Marketing', 'Technology', 'Health', 'Business', 'Education', 'Finance'],
            minPrice: 47.00,
            maxPrice: 497.00,
            minCommission: 30,
            priorityMetrics: ['conversion_rate', 'student_count', 'rating']
        };
        
        return await detector.scanMarket(scrapingConfig);
    }

    async analyzeViability(products) {
        console.log(`📊 ${this.name}: Analizando viabilidad con LLM...`);
        
        const viableProducts = [];
        const LLM_TIMEOUT = 8000; // 8 seconds per product
        const MAX_CONCURRENT = 3; // Max concurrent LLM calls
        const BATCH_DELAY = 1000; // 1 second between batches
        
        // Process products in batches to avoid overwhelming LLM
        for (let i = 0; i < products.length; i += MAX_CONCURRENT) {
            const batch = products.slice(i, i + MAX_CONCURRENT);
            console.log(`🔄 Processing viability batch ${Math.floor(i/MAX_CONCURRENT) + 1}/${Math.ceil(products.length/MAX_CONCURRENT)} (${batch.length} products)`);
            
            const batchPromises = batch.map(async (product, batchIndex) => {
                try {
                    // Usar LLM para análisis de viabilidad con timeout
                    const viabilityPrompt = `
                    Actúa como un experto en análisis de viabilidad de productos de afiliado.
                    
                    Analiza este producto de Hotmart y determina su viabilidad:
                    
                    Producto: ${product.name}
                    Nicho: ${product.niche}
                    Precio: $${product.price || 'N/A'}
                    Comisión: ${product.commission_rate || 40}%
                    
                    Evalúa:
                    1. Demanda del mercado (Alta/Media/Baja)
                    2. Potencial de conversión (Alto/Medio/Bajo)
                    3. Competencia (Baja/Media/Alta)
                    4. Saturación del nicho (Baja/Media/Alta)
                    5. Viabilidad general (Recomendado/No recomendado)
                    
                    Responde en formato JSON:
                    {
                        "demand": "Alta|Media|Baja",
                        "conversion_potential": "Alto|Medio|Bajo", 
                        "competition": "Baja|Media|Alta",
                        "saturation": "Baja|Media|Alta",
                        "viability_score": 0-100,
                        "recommendation": "Recomendado|No recomendado",
                        "reasoning": "Breve explicación de la decisión"
                    }
                    `;
                    
                    const analysis = await Promise.race([
                        this.contentAgent.ollama.chat({
                            model: this.contentAgent.model,
                            messages: [{ role: 'user', content: viabilityPrompt }],
                        }),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('LLM analysis timeout')), LLM_TIMEOUT)
                        )
                    ]);
                    
                    const analysisResult = JSON.parse(analysis.message.content);
                    
                    // Agregar análisis al producto
                    product.viability_analysis = analysisResult;
                    product.analyzed_at = new Date().toISOString();
                    
                    // Solo incluir productos viables
                    if (analysisResult.recommendation === 'Recomendado' && analysisResult.viability_score >= 60) {
                        return product;
                    }
                    
                    console.log(`✅ ${product.name}: ${analysisResult.recommendation} (${analysisResult.viability_score}/100)`);
                    
                } catch (error) {
                    console.error(`❌ Error analizando ${product.name}:`, error.message);
                    // Incluir como no viable si hay error
                    product.viability_analysis = {
                        demand: 'Baja',
                        conversion_potential: 'Bajo',
                        competition: 'Alta',
                        saturation: 'Alta',
                        viability_score: 0,
                        recommendation: 'No recomendado',
                        reasoning: `Error en análisis: ${error.message}`
                    };
                }
                return null; // Not viable
            });
            
            // Wait for batch to complete
            const batchResults = await Promise.all(batchPromises);
            viableProducts.push(...batchResults.filter(p => p !== null));
            
            // Add delay between batches to avoid overwhelming
            if (i + MAX_CONCURRENT < products.length) {
                console.log(`⏳ Waiting ${BATCH_DELAY}ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
            }
        }
        
        return viableProducts;
    }

    async makeAffiliateDecisions(products) {
        console.log(`🤖 ${this.name}: Tomando decisiones de afiliación...`);
        
        const approvedProducts = [];
        
        for (const product of products) {
            try {
                // Decisión final de afiliación con LLM
                const decisionPrompt = `
                Actúa como un experto en programas de afiliados de Hotmart.
                
                Basado en el análisis de viabilidad, toma la decisión final:
                
                Producto: ${product.name}
                Análisis de Viabilidad:
                - Demanda: ${product.viability_analysis.demand}
                - Conversión: ${product.viability_analysis.conversion_potential}
                - Competencia: ${product.viability_analysis.competition}
                - Saturación: ${product.viability_analysis.saturation}
                - Score: ${product.viability_analysis.viability_score}/100
                
                Decisión final:
                1. ¿Activar como afiliado? (Sí/No)
                2. Estrategia de promoción recomendada
                3. Canal principal (Instagram/TikTok/Email)
                4. Tipo de contenido prioritario
                5. Frecuencia de publicación recomendada
                
                Responde en formato JSON:
                {
                    "affiliate_decision": "Sí|No",
                    "promotion_strategy": "Estrategia específica",
                    "primary_channel": "Instagram|TikTok|Email",
                    "content_priority": "Educación|Inspiración|Demostración|Urgencia",
                    "posting_frequency": "Diaria|Semanal|Quincenal",
                    "confidence": 0-100
                }
                `;
                
                const decision = await this.contentAgent.ollama.chat({
                    model: this.contentAgent.model,
                    messages: [{ role: 'user', content: decisionPrompt }],
                });
                
                const decisionResult = JSON.parse(decision.message.content);
                
                // Agregar decisión al producto
                product.affiliate_decision = decisionResult;
                product.decision_made_at = new Date().toISOString();
                
                // Solo incluir productos aprobados para afiliación
                if (decisionResult.affiliate_decision === 'Sí' && decisionResult.confidence >= 70) {
                    approvedProducts.push(product);
                    
                    // Guardar en base de datos
                    await this.saveProductToDatabase(product);
                }
                
                console.log(`🤖 ${product.name}: ${decisionResult.affiliate_decision} (${decisionResult.confidence}% confianza)`);
                
            } catch (error) {
                console.error(`❌ Error en decisión de afiliado ${product.name}:`, error.message);
            }
        }
        
        return approvedProducts;
    }

    async extractContentData(products) {
        console.log(`📝 ${this.name}: Extrayendo data para generación de contenido...`);
        
        const contentReadyProducts = [];
        
        for (const product of products) {
            try {
                // Extraer data específica para contenido
                const contentPrompt = `
                Actúa como un experto en creación de contenido para marketing de afiliados.
                
                Extrae y estructura la información clave para crear contenido viral:
                
                Producto: ${product.name}
                Nicho: ${product.niche}
                Decisión de Afiliado: ${product.affiliate_decision.affiliate_decision}
                Canal Principal: ${product.affiliate_decision.primary_channel}
                Estrategia: ${product.affiliate_decision.promotion_strategy}
                
                Genera data de contenido en formato JSON:
                {
                    "product_name": "${product.name}",
                    "niche": "${product.niche}",
                    "target_audience": "Descripción del público ideal",
                    "pain_points": ["Dolor 1", "Dolor 2", "Dolor 3"],
                    "benefits": ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
                    "unique_selling_proposition": "USP del producto",
                    "content_angles": ["Ángulo 1", "Ángulo 2", "Ángulo 3"],
                    "call_to_action": "CTA específico",
                    "hashtags": ["#tag1", "#tag2", "#tag3"],
                    "content_tone": "Tono de voz recomendado",
                    "posting_schedule": "Horario óptimo para publicar"
                }
                `;
                
                const contentData = await this.contentAgent.ollama.chat({
                    model: this.contentAgent.model,
                    messages: [{ role: 'user', content: contentPrompt }],
                });
                
                const contentResult = JSON.parse(contentData.message.content);
                
                // Agregar data de contenido al producto
                product.content_data = contentResult;
                product.content_extracted_at = new Date().toISOString();
                
                contentReadyProducts.push(product);
                
                console.log(`📝 ${product.name}: Data de contenido extraída`);
                
            } catch (error) {
                console.error(`❌ Error extrayendo content data ${product.name}:`, error.message);
            }
        }
        
        return contentReadyProducts;
    }

    async saveProductToDatabase(product) {
        try {
            const query = `
                INSERT INTO products (
                    hotmart_id, name, description, niche, url_sales_page, 
                    price, commission_rate, performance_score, status,
                    viability_analysis, affiliate_decision, content_data,
                    created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
                ON CONFLICT (hotmart_id) DO UPDATE SET
                    viability_analysis = EXCLUDED.viability_analysis,
                    affiliate_decision = EXCLUDED.affiliate_decision,
                    content_data = EXCLUDED.content_data,
                    updated_at = NOW()
            `;
            
            await this.pool.query(query, [
                product.hotmart_id,
                product.name,
                product.description || `${product.name} - Producto de ${product.niche}`,
                product.niche,
                product.url_sales_page,
                product.price,
                product.commission_rate,
                product.viability_analysis.viability_score || 70,
                'approved_for_affiliate',
                JSON.stringify(product.viability_analysis),
                JSON.stringify(product.affiliate_decision),
                JSON.stringify(product.content_data)
            ]);
            
        } catch (error) {
            console.error(`❌ Error guardando ${product.name} en BD:`, error.message);
        }
    }

    async activateContentAgent(contentData) {
        console.log(`🚀 ${this.name}: Activando ContentAgent para generación de contenido...`);
        
        try {
            // Importar y activar el ContentAgent existente
            const ContentGeneratorAgent = require('./ContentGeneratorAgent');
            const contentGenerator = new ContentGeneratorAgent();
            
            // Pasar la data de contenido para que genere posts
            await contentGenerator.generateContentForProducts(contentData);
            
            console.log(`✅ ContentAgent activado y generando contenido para ${contentData.length} productos`);
            
        } catch (error) {
            console.error(`❌ Error activando ContentAgent:`, error.message);
        }
    }
}

module.exports = SuperScrapingAgent;