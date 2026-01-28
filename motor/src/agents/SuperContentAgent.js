const { Pool } = require('pg');
const ContentAgent = require('./ContentAgent');

class SuperContentAgent {
    constructor() {
        this.name = 'SuperContentAgent';
        this.contentAgent = new ContentAgent();
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: 5432,
        });
    }

    async generateContentForProducts(products) {
        console.log(`📝 ${this.name}: Generando contenido para ${products.length} productos...`);
        
        const generatedContent = [];
        
        for (const product of products) {
            try {
                // Generar múltiples tipos de contenido para cada producto
                const contentTypes = [
                    'instagram_post',
                    'instagram_story', 
                    'tiktok_video',
                    'email_campaign',
                    'blog_article'
                ];
                
                const productContent = {};
                
                for (const contentType of contentTypes) {
                    const content = await this.generateContentType(product, contentType);
                    productContent[contentType] = content;
                }
                
                // Guardar contenido generado
                await this.saveGeneratedContent(product, productContent);
                
                generatedContent.push({
                    product_id: product.hotmart_id,
                    product_name: product.name,
                    content: productContent
                });
                
                console.log(`✅ ${product.name}: ${contentTypes.length} tipos de contenido generados`);
                
            } catch (error) {
                console.error(`❌ Error generando contenido para ${product.name}:`, error.message);
            }
        }
        
        // Activar InstagramAgent para publicación
        await this.activateInstagramAgent(generatedContent);
        
        return generatedContent;
    }

    async generateContentType(product, contentType) {
        const contentData = product.content_data;
        
        let prompt = '';
        
        switch (contentType) {
            case 'instagram_post':
                prompt = `
                Actúa como un experto en Instagram Marketing y copywriting persuasivo.
                
                Crea un POST para Instagram perfecto para este producto:
                
                Producto: ${contentData.product_name}
                Nicho: ${contentData.niche}
                Público: ${contentData.target_audience}
                Dolores: ${contentData.pain_points.join(', ')}
                Beneficios: ${contentData.benefits.join(', ')}
                USP: ${contentData.unique_selling_proposition}
                Tono: ${contentData.content_tone}
                
                Estructura requerida:
                1. Hook potente (primer línea)
                2. Problema + Agitación
                3. Solución (el producto)
                4. Prueba social
                5. Llamado a la acción clara
                6. Hashtags estratégicos
                
                Formato: Máximo 2,200 caracteres. Usa emojis estratégicamente.
                `;
                break;
                
            case 'instagram_story':
                prompt = `
                Actúa como un experto en Instagram Stories.
                
                Crea el guion para 5 STORIES secuenciales:
                
                Producto: ${contentData.product_name}
                Nicho: ${contentData.niche}
                USP: ${contentData.unique_selling_proposition}
                CTA: ${contentData.call_to_action}
                
                Estructura:
                Story 1: Hook + Problema
                Story 2: Agitación + Estadística
                Story 3: Solución + Producto
                Story 4: Prueba social + Beneficio clave
                Story 5: CTA + Link en bio
                
                Cada story: 1-2 líneas máximo. Usa stickers y emojis.
                `;
                break;
                
            case 'tiktok_video':
                prompt = `
                Actúa como un experto en TikTok Marketing viral.
                
                Crea el guion para un video de TIKTOK (15-30 segundos):
                
                Producto: ${contentData.product_name}
                Nicho: ${contentData.niche}
                Dolores: ${contentData.pain_points[0]}
                Beneficio principal: ${contentData.benefits[0]}
                
                Estructura viral:
                0-2s: Hook visual potente
                2-8s: Problema + "¿Te pasa esto?"
                8-20s: Solución + Demo rápida
                20-28s: Resultado + CTA
                28-30s: Link en bio
                
                Incluye: trending sounds, efectos visuales, texto en pantalla.
                `;
                break;
                
            case 'email_campaign':
                prompt = `
                Actúa como un experto en Email Marketing y funnel de conversión.
                
                Crea una secuencia de 3 emails para este producto:
                
                Producto: ${contentData.product_name}
                Público: ${contentData.target_audience}
                USP: ${contentData.unique_selling_proposition}
                
                Email 1: Problema + Agitación (Storytelling)
                Email 2: Solución + Prueba social
                Email 3: Urgencia + Oferta especial
                
                Cada email: Asunto potente, personalización, CTA claro.
                `;
                break;
                
            case 'blog_article':
                prompt = `
                Actúa como un experto en Content Marketing y SEO.
                
                Crea un artículo de blog optimizado:
                
                Título: ${contentData.product_name} - Review Completo 2024
                Palabras clave: ${contentData.hashtags.join(', ')}
                Nicho: ${contentData.niche}
                
                Estructura SEO:
                - Introducción con hook
                - ¿Qué es y para quién es?
                - Beneficios principales (con datos)
                - ¿Cómo funciona? (demo)
                - Pros y contras (honesto)
                - ¿Vale la pena? (conclusión)
                - CTA + Bonificación
                
                1500-2000 palabras. Tono: ${contentData.content_tone}.
                `;
                break;
        }
        
        try {
            const response = await this.contentAgent.ollama.chat({
                model: this.contentAgent.model,
                messages: [{ role: 'user', content: prompt }],
            });
            
            return {
                type: contentType,
                content: response.message.content,
                generated_at: new Date().toISOString(),
                product_id: product.hotmart_id
            };
            
        } catch (error) {
            console.error(`❌ Error generando ${contentType} para ${product.name}:`, error.message);
            return null;
        }
    }

    async saveGeneratedContent(product, content) {
        try {
            for (const [contentType, contentData] of Object.entries(content)) {
                if (contentData) {
                    const query = `
                        INSERT INTO generated_content (
                            product_id, content_type, title, content, 
                            platform, status, agent_name, created_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                    `;
                    
                    await this.pool.query(query, [
                        product.hotmart_id,
                        contentType,
                        `${product.name} - ${contentType}`,
                        contentData.content,
                        this.getPlatformForType(contentType),
                        'ready_to_publish',
                        this.name
                    ]);
                }
            }
        } catch (error) {
            console.error(`❌ Error guardando contenido generado:`, error.message);
        }
    }

    getPlatformForType(contentType) {
        const platformMap = {
            'instagram_post': 'Instagram',
            'instagram_story': 'Instagram',
            'tiktok_video': 'TikTok',
            'email_campaign': 'Email',
            'blog_article': 'Blog'
        };
        return platformMap[contentType] || 'Unknown';
    }

    async activateInstagramAgent(content) {
        console.log(`📱 ${this.name}: Activando InstagramAgent para publicar contenido...`);
        
        try {
            // Importar y activar el InstagramAgent existente
            const InstagramAgent = require('./InstagramAgent');
            const instagramAgent = new InstagramAgent();
            
            // Filtrar solo contenido de Instagram
            const instagramContent = content.filter(item => 
                item.content.instagram_post || item.content.instagram_story
            );
            
            // Activar publicación en Instagram
            await instagramAgent.publishContent(instagramContent);
            
            console.log(`✅ InstagramAgent activado para ${instagramContent.length} productos`);
            
        } catch (error) {
            console.error(`❌ Error activando InstagramAgent:`, error.message);
        }
    }

    async getContentAnalytics(productId) {
        try {
            const query = `
                SELECT content_type, platform, status, created_at,
                       engagement_metrics
                FROM generated_content 
                WHERE product_id = $1
                ORDER BY created_at DESC
            `;
            
            const result = await this.pool.query(query, [productId]);
            return result.rows;
            
        } catch (error) {
            console.error(`❌ Error obteniendo analytics:`, error.message);
            return [];
        }
    }
}

module.exports = SuperContentAgent;