import { jest } from '@jest/globals';
import SuperAnalyticsAgent from '../../../motor/src/agents/SuperAnalyticsAgent.js';

describe('SuperAnalyticsAgent', () => {
  let superAnalyticsAgent;
  let mockPool;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    };
    superAnalyticsAgent = new SuperAnalyticsAgent(mockPool);
  });

  describe('init', () => {
    it('should initialize analytics engine', async () => {
      await expect(superAnalyticsAgent.init()).resolves.not.toThrow();
      expect(superAnalyticsAgent.status).toBe('active');
      expect(superAnalyticsAgent.metrics).toHaveProperty('engagement');
      expect(superAnalyticsAgent.metrics).toHaveProperty('conversion');
      expect(superAnalyticsAgent.metrics).toHaveProperty('revenue');
    });

    it('should load historical data patterns', async () => {
      mockPool.query.mockResolvedValue({
        rows: [
          { date: '2024-01-01', metric: 'conversion_rate', value: 3.2 },
          { date: '2024-01-02', metric: 'conversion_rate', value: 3.5 }
        ]
      });

      await superAnalyticsAgent.init();
      
      expect(superAnalyticsAgent.historicalData.size).toBeGreaterThan(0);
      expect(superAnalyticsAgent.patterns).toBeDefined();
    });
  });

  describe('analyzeProductPerformance', () => {
    it('should analyze comprehensive product metrics', async () => {
      const productId = 'product_123';
      
      mockPool.query
        .mockResolvedValueOnce({
          rows: [{
            product_id: productId,
            name: 'Test Course',
            total_sales: 150,
            total_revenue: 14550.00,
            conversion_rate: 3.2,
            refund_rate: 5.1,
            avg_rating: 4.7
          }]
        })
        .mockResolvedValueOnce({
          rows: [
            { date: '2024-01-01', sales: 10, revenue: 970 },
            { date: '2024-01-02', sales: 12, revenue: 1164 }
          ]
        });

      const analysis = await superAnalyticsAgent.analyzeProductPerformance(productId);
      
      expect(analysis).toHaveProperty('performance_metrics');
      expect(analysis).toHaveProperty('trend_analysis');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis).toHaveProperty('performance_score');
      expect(analysis.performance_score).toBeGreaterThanOrEqual(0);
      expect(analysis.performance_score).toBeLessThanOrEqual(100);
    });

    it('should calculate growth trends', async () => {
      const timeSeriesData = [
        { period: '2024-01', revenue: 5000, sales: 50 },
        { period: '2024-02', revenue: 7500, sales: 75 },
        { period: '2024-03', revenue: 10000, sales: 100 }
      ];

      const trends = await superAnalyticsAgent.calculateTrends(timeSeriesData);
      
      expect(trends).toHaveProperty('revenue_growth');
      expect(trends).toHaveProperty('sales_growth');
      expect(trends).toHaveProperty('growth_rate');
      expect(trends).toHaveProperty('forecast');
      expect(trends.revenue_growth).toBeGreaterThan(0);
      expect(trends.sales_growth).toBeGreaterThan(0);
    });
  });

  describe('marketAnalysis', () => {
    it('should analyze market trends and opportunities', async () => {
      mockPool.query.mockResolvedValue({
        rows: [
          { niche: 'Technology', avg_price: 97, avg_conversion: 3.2, total_products: 150 },
          { niche: 'Health', avg_price: 67, avg_conversion: 2.8, total_products: 200 },
          { niche: 'Finance', avg_price: 147, avg_conversion: 4.1, total_products: 80 }
        ]
      });

      const marketAnalysis = await superAnalyticsAgent.analyzeMarket();
      
      expect(marketAnalysis).toHaveProperty('market_overview');
      expect(marketAnalysis).toHaveProperty('competitive_landscape');
      expect(marketAnalysis).toHaveProperty('opportunities');
      expect(marketAnalysis).toHaveProperty('market_saturation');
      expect(marketAnalysis.opportunities.length).toBeGreaterThan(0);
    });

    it('should identify underserved niches', async () => {
      const nicheData = [
        { niche: 'AI & Machine Learning', competition: 'low', demand: 'high', avg_price: 197 },
        { niche: 'Basic Web Development', competition: 'high', demand: 'medium', avg_price: 47 }
      ];

      const opportunities = await superAnalyticsAgent.findOpportunities(nicheData);
      
      expect(opportunities).toHaveProperty('underserved_niches');
      expect(opportunities).toHaveProperty('growth_potential');
      expect(opportunities.underserved_niches[0].niche).toBe('AI & Machine Learning');
      expect(opportunities.underserved_niches[0].opportunity_score).toBeGreaterThan(80);
    });
  });

  describe('customerBehaviorAnalytics', () => {
    it('should analyze customer journey and behavior', async () => {
      const customerData = {
        touchpoints: [
          { stage: 'awareness', channel: 'social_media', conversion: 0.05 },
          { stage: 'consideration', channel: 'email', conversion: 0.12 },
          { stage: 'purchase', channel: 'direct', conversion: 0.08 }
        ],
        demographics: {
          age_groups: { '18-24': 0.2, '25-34': 0.4, '35-44': 0.3, '45+': 0.1 },
          locations: { 'US': 0.4, 'BR': 0.3, 'ES': 0.2, 'Other': 0.1 }
        }
      };

      const behaviorAnalysis = await superAnalyticsAgent.analyzeCustomerBehavior(customerData);
      
      expect(behaviorAnalysis).toHaveProperty('conversion_funnel');
      expect(behaviorAnalysis).toHaveProperty('customer_segments');
      expect(behaviorAnalysis).toHaveProperty('behavior_patterns');
      expect(behaviorAnalysis).toHaveProperty('recommendations');
      expect(behaviorAnalysis.conversion_funnel.total_conversion_rate).toBeGreaterThan(0);
    });

    it('should predict customer lifetime value', async () => {
      const customerMetrics = {
        avg_order_value: 97.00,
        purchase_frequency: 2.3,
        customer_lifespan: 24, // months
        retention_rate: 0.85
      };

      const clv = await superAnalyticsAgent.calculateCLV(customerMetrics);
      
      expect(clv).toHaveProperty('customer_lifetime_value');
      expect(clv).toHaveProperty('confidence_interval');
      expect(clv).toHaveProperty('growth_potential');
      expect(clv.customer_lifetime_value).toBeGreaterThan(0);
    });
  });

  describe('contentPerformanceAnalytics', () => {
    it('should analyze content effectiveness across platforms', async () => {
      mockPool.query.mockResolvedValue({
        rows: [
          {
            content_id: 'ig_123',
            platform: 'instagram',
            type: 'post',
            engagement_rate: 4.2,
            reach: 5000,
            clicks: 210,
            conversions: 8
          },
          {
            content_id: 'email_456',
            platform: 'email',
            type: 'campaign',
            open_rate: 0.28,
            click_rate: 0.045,
            conversions: 15
          }
        ]
      });

      const contentAnalysis = await superAnalyticsAgent.analyzeContentPerformance();
      
      expect(contentAnalysis).toHaveProperty('platform_comparison');
      expect(contentAnalysis).toHaveProperty('best_performing_content');
      expect(contentAnalysis).toHaveProperty('content_insights');
      expect(contentAnalysis).toHaveProperty('recommendations');
      expect(contentAnalysis.platform_comparison.length).toBeGreaterThan(0);
    });

    it('should optimize content strategy', async () => {
      const performanceData = {
        platforms: {
          instagram: { engagement: 4.2, conversion: 0.16, cost_per_acquisition: 12.50 },
          tiktok: { engagement: 6.8, conversion: 0.12, cost_per_acquisition: 18.75 },
          email: { engagement: 2.1, conversion: 0.28, cost_per_acquisition: 8.33 }
        }
      };

      const strategy = await superAnalyticsAgent.optimizeContentStrategy(performanceData);
      
      expect(strategy).toHaveProperty('recommended_mix');
      expect(strategy).toHaveProperty('budget_allocation');
      expect(strategy).toHaveProperty('expected_improvement');
      expect(strategy.recommended_mix).toHaveProperty('instagram');
      expect(strategy.recommended_mix).toHaveProperty('tiktok');
      expect(strategy.recommended_mix).toHaveProperty('email');
    });
  });

  describe('predictiveAnalytics', () => {
    it('should forecast revenue and sales', async () => {
      const historicalData = [
        { month: '2023-10', revenue: 8000, sales: 80 },
        { month: '2023-11', revenue: 9500, sales: 95 },
        { month: '2023-12', revenue: 12000, sales: 120 },
        { month: '2024-01', revenue: 11000, sales: 110 }
      ];

      const forecast = await superAnalyticsAgent.forecastPerformance(historicalData);
      
      expect(forecast).toHaveProperty('next_month');
      expect(forecast).toHaveProperty('next_quarter');
      expect(forecast).toHaveProperty('confidence_level');
      expect(forecast).toHaveProperty('trend_direction');
      expect(forecast.next_month.revenue).toBeGreaterThan(0);
      expect(forecast.confidence_level).toBeGreaterThan(0);
      expect(forecast.confidence_level).toBeLessThanOrEqual(1);
    });

    it('should identify early warning signals', async () => {
      const currentMetrics = {
        conversion_rate: 2.1, // Down from usual 3.2
        traffic_quality_score: 0.65, // Down from usual 0.8
        customer_satisfaction: 4.2, // Down from usual 4.7
        refund_rate: 8.5 // Up from usual 5.1
      };

      const warnings = await superAnalyticsAgent.detectEarlyWarnings(currentMetrics);
      
      expect(warnings).toHaveProperty('alerts');
      expect(warnings).toHaveProperty('severity_level');
      expect(warnings).toHaveProperty('recommended_actions');
      expect(warnings.alerts.length).toBeGreaterThan(0);
      expect(warnings.severity_level).toBeOneOf(['low', 'medium', 'high', 'critical']);
    });
  });

  describe('reporting', () => {
    it('should generate comprehensive reports', async () => {
      const reportConfig = {
        period: 'monthly',
        include_forecasts: true,
        include_recommendations: true,
        format: 'detailed'
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ total_revenue: 50000, total_sales: 500 }] })
        .mockResolvedValueOnce({ rows: [{ platform: 'instagram', conversions: 50 }] });

      const report = await superAnalyticsAgent.generateReport(reportConfig);
      
      expect(report).toHaveProperty('executive_summary');
      expect(report).toHaveProperty('detailed_metrics');
      expect(report).toHaveProperty('forecasts');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('action_items');
      expect(report.executive_summary.key_insights.length).toBeGreaterThan(0);
    });

    it('should create real-time dashboards', async () => {
      const dashboardConfig = {
        refresh_interval: 300, // 5 minutes
        metrics: ['revenue', 'conversion', 'engagement'],
        platforms: ['instagram', 'tiktok', 'email']
      };

      const dashboard = await superAnalyticsAgent.createDashboard(dashboardConfig);
      
      expect(dashboard).toHaveProperty('widgets');
      expect(dashboard).toHaveProperty('real_time_data');
      expect(dashboard).toHaveProperty('alerts');
      expect(dashboard.widgets.length).toBeGreaterThan(0);
    });
  });

  describe('integrationWithOtherAgents', () => {
    it('should provide insights for content generation', async () => {
      const contentAgentRequest = {
        product_niche: 'Technology',
        target_audience: 'developers',
        platform: 'instagram'
      };

      const insights = await superAnalyticsAgent.getContentInsights(contentAgentRequest);
      
      expect(insights).toHaveProperty('optimal_posting_times');
      expect(insights).toHaveProperty('best_performing_topics');
      expect(insights).toHaveProperty('audience_preferences');
      expect(insights.optimal_posting_times).toBeInstanceOf(Array);
    });

    it('should inform scraping priorities', async () => {
      const scrapingAgentRequest = {
        current_portfolio: ['Technology', 'Business'],
        performance_threshold: 0.7
      };

      const priorities = await superAnalyticsAgent.getScrapingPriorities(scrapingAgentRequest);
      
      expect(priorities).toHaveProperty('target_niches');
      expect(priorities).toHaveProperty('opportunity_score');
      expect(priorities).toHaveProperty('scraping_frequency');
      expect(priorities.target_niches.length).toBeGreaterThan(0);
    });
  });

  describe('errorHandling', () => {
    it('should handle missing data gracefully', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await superAnalyticsAgent.analyzeProductPerformance('nonexistent');
      
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('fallback_analysis');
      expect(result.error).toContain('insufficient data');
    });

    it('should validate forecast inputs', async () => {
      const invalidData = [
        { month: '2024-01', revenue: -1000, sales: -10 } // Invalid negative values
      ];

      const result = await superAnalyticsAgent.forecastPerformance(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.validation_errors).toBeDefined();
    });
  });

  describe('stop', () => {
    it('should save analytics state before stopping', async () => {
      const saveStateSpy = jest.spyOn(superAnalyticsAgent, 'saveState');
      
      await superAnalyticsAgent.stop();
      
      expect(saveStateSpy).toHaveBeenCalled();
      expect(superAnalyticsAgent.status).toBe('inactive');
    });
  });
});