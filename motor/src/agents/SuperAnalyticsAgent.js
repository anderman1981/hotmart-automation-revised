const { Pool } = require('pg');

class SuperAnalyticsAgent {
    constructor() {
        this.name = 'SuperAnalyticsAgent';
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: 5432,
        });
    }

    async generateComprehensiveReport() {
        console.log(`📊 ${this.name}: Generando reporte analítico completo...`);
        
        try {
            const report = {
                // 1. Métricas de Productos
                products: await this.getProductMetrics(),
                
                // 2. Análisis de Contenido
                content: await this.getContentMetrics(),
                
                // 3. Insights de Mercado
                market: await this.getMarketInsights(),
                
                // 4. Tendencias y Predicciones
                trends: await this.getTrendsAndPredictions(),
                
                // 5. ROI y Rendimiento
                performance: await this.getPerformanceMetrics(),
                
                // 6. Recomendaciones Estratégicas
                recommendations: await this.generateRecommendations()
            };
            
            console.log(`✅ Reporte completo generado para ${report.products.total} productos`);
            return report;
            
        } catch (error) {
            console.error(`❌ Error generando reporte:`, error);
            return { error: error.message };
        }
    }

    async getProductMetrics() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                    COUNT(CASE WHEN status = 'testing' THEN 1 END) as testing,
                    COUNT(CASE WHEN status = 'cold' THEN 1 END) as cold,
                    AVG(performance_score) as avg_performance,
                    AVG(affiliate_commission) as avg_commission,
                    SUM(total_revenue) as total_revenue,
                    SUM(total_commissions) as total_commissions,
                    niche,
                    COUNT(*) as count_by_niche
                FROM products 
                GROUP BY niche
                ORDER BY count_by_niche DESC
            `;
            
            const result = await this.pool.query(query);
            
            return {
                total_by_niche: result.rows,
                overall_total: result.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
                overall_performance: result.rows.reduce((sum, row) => sum + parseFloat(row.avg_performance), 0) / result.rows.length,
                top_performing_niche: result.rows.reduce((max, row) => row.avg_performance > max.avg_performance ? row : max),
                revenue_generated: result.rows.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0)
            };
            
        } catch (error) {
            console.error('Error en getProductMetrics:', error);
            return {};
        }
    }

    async getContentMetrics() {
        try {
            const query = `
                SELECT 
                    content_type,
                    platform,
                    COUNT(*) as total_generated,
                    COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
                    COUNT(CASE WHEN status = 'ready_to_publish' THEN 1 END) as pending,
                    AVG(engagement_metrics->>'likes') as avg_likes,
                    AVG(engagement_metrics->>'comments') as avg_comments,
                    AVG(engagement_metrics->>'shares') as avg_shares,
                    AVG(engagement_metrics->>'clicks') as avg_clicks,
                    DATE_TRUNC('day', created_at) as date,
                    COUNT(*) as daily_count
                FROM generated_content 
                WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY content_type, platform, DATE_TRUNC('day', created_at)
                ORDER BY date DESC
            `;
            
            const result = await this.pool.query(query);
            
            // Calcular tasas de engagement
            const engagementRates = result.rows.map(row => ({
                ...row,
                engagement_rate: this.calculateEngagementRate(row)
            }));
            
            return {
                by_type_and_platform: engagementRates,
                total_generated: result.rows.reduce((sum, row) => sum + parseInt(row.total_generated), 0),
                published: result.rows.reduce((sum, row) => sum + parseInt(row.published || 0), 0),
                pending: result.rows.reduce((sum, row) => sum + parseInt(row.pending || 0), 0),
                avg_engagement_rate: engagementRates.reduce((sum, row) => sum + row.engagement_rate, 0) / engagementRates.length
            };
            
        } catch (error) {
            console.error('Error en getContentMetrics:', error);
            return {};
        }
    }

    async getMarketInsights() {
        try {
            const query = `
                SELECT 
                    niche,
                    AVG(performance_score) as avg_performance,
                    COUNT(*) as product_count,
                    AVG(CASE WHEN total_revenue > 0 THEN total_revenue ELSE 0 END) as avg_revenue,
                    AVG(affiliate_commission) as avg_commission,
                    COUNT(CASE WHEN affiliate_status = 'active' THEN 1 END) as affiliate_active
                FROM products 
                GROUP BY niche
                HAVING COUNT(*) >= 3
                ORDER BY avg_performance DESC
            `;
            
            const result = await this.pool.query(query);
            
            // Identificar insights clave
            const insights = {
                top_niches: result.rows.slice(0, 3),
                most_profitable_niche: result.rows.reduce((max, row) => row.avg_revenue > max.avg_revenue ? row : max),
                best_affiliate_niche: result.rows.reduce((max, row) => row.affiliate_active > max.affiliate_active ? row : max),
                market_saturation: this.calculateMarketSaturation(result.rows)
            };
            
            return insights;
            
        } catch (error) {
            console.error('Error en getMarketInsights:', error);
            return {};
        }
    }

    async getTrendsAndPredictions() {
        try {
            // Tendencias de contenido
            const contentTrendsQuery = `
                SELECT 
                    DATE_TRUNC('week', created_at) as week,
                    content_type,
                    COUNT(*) as content_volume,
                    AVG(engagement_metrics->>'engagement_rate') as avg_engagement
                FROM generated_content 
                WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks'
                GROUP BY DATE_TRUNC('week', created_at), content_type
                ORDER BY week DESC
            `;
            
            const contentTrends = await this.pool.query(contentTrendsQuery);
            
            // Predicciones basadas en tendencias
            const predictions = {
                content_trend: this.analyzeContentTrends(contentTrends.rows),
                next_hot_niche: await this.predictNextHotNiche(),
                optimal_content_types: await this.getOptimalContentTypes(),
                market_opportunities: await this.identifyMarketOpportunities()
            };
            
            return predictions;
            
        } catch (error) {
            console.error('Error en getTrendsAndPredictions:', error);
            return {};
        }
    }

    async getPerformanceMetrics() {
        try {
            const query = `
                SELECT 
                    SUM(total_revenue) as total_revenue,
                    SUM(total_commissions) as total_commissions,
                    COUNT(CASE WHEN affiliate_status = 'active' THEN 1 END) as active_affiliates,
                    AVG(performance_score) as avg_product_performance,
                    COUNT(CASE WHEN performance_score >= 80 THEN 1 END) as top_performers,
                    COUNT(CASE WHEN last_activity >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recently_active
                FROM products
            `;
            
            const result = await this.pool.query(query);
            const metrics = result.rows[0];
            
            // Calcular métricas derivadas
            const roi = metrics.total_commissions > 0 ? 
                ((metrics.total_revenue - metrics.total_commissions) / metrics.total_commissions) * 100 : 0;
            
            const performance = {
                ...metrics,
                roi_percentage: roi,
                conversion_rate: metrics.active_affiliates > 0 ? 
                    (metrics.top_performers / metrics.active_affiliates) * 100 : 0,
                activity_rate: metrics.total > 0 ? 
                    (metrics.recently_active / metrics.total) * 100 : 0
            };
            
            return performance;
            
        } catch (error) {
            console.error('Error en getPerformanceMetrics:', error);
            return {};
        }
    }

    async generateRecommendations() {
        console.log(`🧠 ${this.name}: Generando recomendaciones estratégicas...`);
        
        try {
            // Obtener datos actuales
            const productMetrics = await this.getProductMetrics();
            const contentMetrics = await this.getContentMetrics();
            const marketInsights = await this.getMarketInsights();
            
            const recommendations = [];
            
            // Recomendaciones de productos
            if (productMetrics.overall_performance < 70) {
                recommendations.push({
                    type: 'product_optimization',
                    priority: 'high',
                    title: 'Optimizar Performance de Productos',
                    description: 'El rendimiento promedio de productos está por debajo del 70%. Considerar enfocarse en nichos de mejor rendimiento.',
                    action: 'Analizar y eliminar productos con performance < 50'
                });
            }
            
            // Recomendaciones de contenido
            if (contentMetrics.avg_engagement_rate < 5) {
                recommendations.push({
                    type: 'content_optimization',
                    priority: 'high',
                    title: 'Mejorar Tasa de Engagement',
                    description: 'La tasa de engagement promedio es baja. Revisar estrategia de contenido.',
                    action: 'Implementar A/B testing en títulos y llamados a la acción'
                });
            }
            
            // Recomendaciones de nicho
            if (marketInsights.top_performing_niche) {
                recommendations.push({
                    type: 'niche_expansion',
                    priority: 'medium',
                    title: 'Expandir Nicho Top',
                    description: `${marketInsights.top_performing_niche.niche} está mostrando el mejor rendimiento.`,
                    action: `Buscar más productos en el nicho ${marketInsights.top_performing_niche.niche}`
                });
            }
            
            // Recomendaciones de automatización
            if (contentMetrics.pending > contentMetrics.published * 2) {
                recommendations.push({
                    type: 'automation',
                    priority: 'high',
                    title: 'Automizar Publicación de Contenido',
                    description: 'Hay mucho contenido pendiente por publicar.',
                    action: 'Activar publicación automática programada'
                });
            }
            
            return recommendations;
            
        } catch (error) {
            console.error('Error generando recomendaciones:', error);
            return [];
        }
    }

    // Métodos auxiliares
    calculateEngagementRate(row) {
        const likes = parseInt(row.avg_likes || 0);
        const comments = parseInt(row.avg_comments || 0);
        const shares = parseInt(row.avg_shares || 0);
        const clicks = parseInt(row.avg_clicks || 0);
        
        const totalEngagement = likes + comments + (shares * 2) + (clicks * 3);
        const maxPossibleEngagement = 1000; // Base para cálculo
        
        return (totalEngagement / maxPossibleEngagement) * 100;
    }

    calculateMarketSaturation(niches) {
        const totalProducts = niches.reduce((sum, niche) => sum + parseInt(niche.product_count), 0);
        
        return niches.map(niche => ({
            niche: niche.niche,
            saturation: (niche.product_count / totalProducts) * 100,
            level: niche.product_count / totalProducts > 0.3 ? 'High' : 
                   niche.product_count / totalProducts > 0.15 ? 'Medium' : 'Low'
        }));
    }

    analyzeContentTrends(trendData) {
        // Análisis simple de tendencias
        const recentWeeks = trendData.slice(0, 4);
        const olderWeeks = trendData.slice(4, 8);
        
        const recentVolume = recentWeeks.reduce((sum, week) => sum + parseInt(week.content_volume), 0);
        const olderVolume = olderWeeks.reduce((sum, week) => sum + parseInt(week.content_volume), 0);
        
        return {
            trend: recentVolume > olderVolume ? 'increasing' : 'decreasing',
            growth_rate: ((recentVolume - olderVolume) / olderVolume) * 100,
            top_content_type: this.getTopContentType(recentWeeks)
        };
    }

    async predictNextHotNiche() {
        try {
            const query = `
                SELECT niche, AVG(performance_score) as avg_score, COUNT(*) as count
                FROM products 
                WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
                GROUP BY niche
                ORDER BY avg_score DESC, count DESC
                LIMIT 1
            `;
            
            const result = await this.pool.query(query);
            return result.rows[0]?.niche || 'Unknown';
        } catch (error) {
            return 'Unknown';
        }
    }

    async getOptimalContentTypes() {
        try {
            const query = `
                SELECT content_type, AVG(engagement_metrics->>'engagement_rate') as avg_engagement
                FROM generated_content 
                WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY content_type
                ORDER BY avg_engagement DESC
            `;
            
            const result = await this.pool.query(query);
            return result.rows.map(row => row.content_type);
        } catch (error) {
            return [];
        }
    }

    async identifyMarketOpportunities() {
        try {
            const query = `
                SELECT niche 
                FROM products 
                GROUP BY niche 
                HAVING COUNT(*) < 3
                ORDER BY AVG(performance_score) DESC
            `;
            
            const result = await this.pool.query(query);
            return result.rows.map(row => ({
                niche: row.niche,
                opportunity: 'Low competition, high potential',
                recommendation: 'Research more products in this niche'
            }));
        } catch (error) {
            return [];
        }
    }

    getTopContentType(data) {
        const typeVolumes = {};
        data.forEach(item => {
            if (!typeVolumes[item.content_type]) {
                typeVolumes[item.content_type] = 0;
            }
            typeVolumes[item.content_type] += parseInt(item.content_volume);
        });
        
        return Object.keys(typeVolumes).reduce((a, b) => 
            typeVolumes[a] > typeVolumes[b] ? a : b
        );
    }
}

module.exports = SuperAnalyticsAgent;