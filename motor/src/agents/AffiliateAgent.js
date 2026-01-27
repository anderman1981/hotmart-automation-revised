import pg from 'pg';
const { Pool } = pg;

class AffiliateAgent {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: 5432,
        });
        this.platform = 'hotmart';
        this.commissionRate = 0.40; // 40% default commission
        this.minCommissionThreshold = 0.15; // 15% minimum commission
        console.log('🔗 Affiliate Agent: Initialized');
    }

    async generateAffiliateLink(hotmartId, platform = 'hotmart') {
        try {
            console.log(`🔗 Generating affiliate link for product: ${hotmartId}`);
            
            // Generate Hotmart affiliate URL with correct format
            const affiliateUrl = `https://go.hotmart.com/${hotmartId}`;
            
            // Get product details to calculate commission
            const productResult = await this.pool.query(
                'SELECT affiliate_commission FROM products WHERE hotmart_id = $1',
                [hotmartId]
            );
            
            let commissionRate = this.commissionRate;
            if (productResult.rowCount > 0) {
                const product = productResult.rows[0];
                commissionRate = Math.max(
                    this.minCommissionThreshold,
                    (product.affiliate_commission || 40) / 100
                );
            }
            
            // Store affiliate link in database
            await this.pool.query(
                'UPDATE products SET affiliate_url = $1, affiliate_commission = $2, affiliate_analyzed_at = NOW() WHERE hotmart_id = $3',
                [affiliateUrl, commissionRate * 100, hotmartId]
            );
            
            return {
                affiliateUrl,
                commissionRate: commissionRate * 100,
                platform,
                hotmartId,
                message: `Link generado exitosamente para ${hotmartId}`
            };
            
        } catch (error) {
            console.error('❌ Error generando link afiliado:', error);
            throw error;
        }
    }

    async processProduct(productId) {
        try {
            console.log(`🔗 Procesando producto ${productId} para afiliación...`);
            
            // Get product details
            const productResult = await this.pool.query(
                'SELECT * FROM products WHERE id = $1',
                [productId]
            );
            
            if (productResult.rowCount === 0) {
                return { status: 'error', message: 'Producto no encontrado' };
            }
            
            const product = productResult.rows[0];
            
            // Generate affiliate link
            const linkResult = await this.generateAffiliateLink(product.hotmart_id, 'hotmart');
            
            // Generate initial content for affiliate promotion
            const contentResult = await this.generateAffiliateContent(product, linkResult.affiliateUrl);
            
            return {
                status: 'success',
                affiliateUrl: linkResult.affiliateUrl,
                commissionRate: linkResult.commissionRate,
                content: contentResult,
                message: `Producto ${product.name} procesado exitosamente para afiliación`
            };
            
        } catch (error) {
            console.error('❌ Error procesando producto para afiliación:', error);
            return { status: 'error', error: error.message };
        }
    }

    async generateAffiliateContent(product, affiliateUrl) {
        try {
            // Import ContentAgent dynamically to avoid circular dependencies
            const { default: contentAgent } = await import('./ContentAgent.js');
            
            console.log(`📝 Generando contenido afiliado para ${product.name}...`);
            
            // Generate marketing copy for affiliate promotion
            const marketingCopy = await contentAgent.generateMarketingPost(
                product.name,
                product.niche || 'general'
            );
            
            // Generate image prompt for affiliate content
            const imagePrompt = await contentAgent.generateImagePrompt(
                product.name,
                product.niche || 'general'
            );
            
            // Generate custom affiliate-focused content
            const affiliateContent = {
                title: `¡${product.name} - La Mejor Opción!`,
                description: `Descubre por qué ${product.name} está revolucionando el mercado. Oferta especial por tiempo limitado.`,
                callToAction: `🔥 ¡Compra ahora con descuento exclusivo! 🔥`,
                hashtags: `#${product.name.replace(/\s+/g, '')} #Oferta #MejorOpción #Recomendado`,
                marketingCopy,
                imagePrompt,
                affiliateUrl
            };
            
            return affiliateContent;
            
        } catch (error) {
            console.error('❌ Error generando contenido afiliado:', error);
            // Fallback content if ContentAgent fails
            return {
                title: product.name,
                description: `Excelente producto en categoría ${product.niche || 'general'}`,
                callToAction: '¡Compra ahora!',
                hashtags: `#${product.name.replace(/\s+/g, '')} #Recomendado`,
                marketingCopy: `Descubre ${product.name}`,
                imagePrompt: `Professional product photo of ${product.name}`,
                affiliateUrl
            };
        }
    }

    async getAffiliateMetrics() {
        try {
            const result = await this.pool.query(`
                SELECT 
                    COUNT(*) as total_products,
                    COUNT(CASE WHEN affiliate_url IS NOT NULL THEN 1 END) as affiliate_products,
                    COUNT(CASE WHEN affiliate_status = 'active' THEN 1 END) as active_products,
                    COUNT(CASE WHEN affiliate_status = 'cold' THEN 1 END) as cold_products,
                    AVG(affiliate_commission) as avg_commission,
                    COUNT(CASE WHEN affiliate_materials_count > 0 THEN 1 END) as products_with_materials
                FROM products
            `);
            
            const stats = result.rows[0];
            
            return {
                totalProducts: parseInt(stats.total_products),
                affiliateProducts: parseInt(stats.affiliate_products),
                activeProducts: parseInt(stats.active_products),
                coldProducts: parseInt(stats.cold_products),
                avgCommission: parseFloat(stats.avg_commission || 0),
                productsWithMaterials: parseInt(stats.products_with_materials)
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo métricas:', error);
            throw error;
        }
    }

    async stop() {
        console.log('🔗 Affiliate Agent: Stopping...');
        return { status: 'stopped' };
    }
}

export default new AffiliateAgent();