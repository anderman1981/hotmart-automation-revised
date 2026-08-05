import { jest } from '@jest/globals';
import SuperScrapingAgent from '../../../motor/src/agents/SuperScrapingAgent.js';

describe('SuperScrapingAgent', () => {
  let superScrapingAgent;
  let mockPool;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    };
    superScrapingAgent = new SuperScrapingAgent(mockPool);
  });

  describe('init', () => {
    it('should initialize scraping capabilities', async () => {
      await expect(superScrapingAgent.init()).resolves.not.toThrow();
      expect(superScrapingAgent.status).toBe('active');
      expect(superScrapingAgent.browser).toBeDefined();
      expect(superScrapingAgent.extractors).toHaveProperty('hotmart');
      expect(superScrapingAgent.extractors).toHaveProperty('marketplace');
    });

    it('should set up anti-detection measures', async () => {
      await superScrapingAgent.init();
      
      expect(superScrapingAgent.userAgents.length).toBeGreaterThan(0);
      expect(superScrapingAgent.proxies).toBeInstanceOf(Array);
      expect(superScrapingAgent.rotationEnabled).toBe(true);
    });
  });

  describe('scrapeHotmartProducts', () => {
    it('should scrape products from Hotmart marketplace', async () => {
      const category = 'technology';
      const limit = 10;

      // Mock puppeteer page
      const mockPage = {
        goto: jest.fn(),
        waitForSelector: jest.fn(),
        evaluate: jest.fn(() => Promise.resolve([
          {
            name: 'AI Course',
            price: 97.00,
            rating: 4.8,
            students: 1500,
            hotmart_id: 'HM-TEST123'
          }
        ])),
        close: jest.fn()
      };

      superScrapingAgent.browser = {
        newPage: jest.fn(() => Promise.resolve(mockPage)),
        close: jest.fn()
      };

      const products = await superScrapingAgent.scrapeHotmartProducts(category, limit);
      
      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toHaveProperty('name');
      expect(products[0]).toHaveProperty('price');
      expect(products[0]).toHaveProperty('hotmart_id');
    });

    it('should handle rate limiting gracefully', async () => {
      const mockPage = {
        goto: jest.fn(() => Promise.reject(new Error('Rate limited'))),
        close: jest.fn()
      };

      superScrapingAgent.browser = {
        newPage: jest.fn(() => Promise.resolve(mockPage))
      };

      const result = await superScrapingAgent.scrapeHotmartProducts('business', 5);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('rate limit');
      expect(result.retry_after).toBeDefined();
    });

    it('should extract comprehensive product data', async () => {
      const mockPage = {
        goto: jest.fn(),
        waitForSelector: jest.fn(),
        evaluate: jest.fn(() => Promise.resolve({
          name: 'Complete Marketing Course',
          description: 'Learn marketing strategies',
          price: 147.00,
          originalPrice: 297.00,
          rating: 4.9,
          reviews: 245,
          students: 5200,
          instructor: 'Marketing Expert',
          duration: '12 hours',
          certificate: true,
          hotmart_id: 'HM-MARKET123',
          affiliate_commission: 40,
          promotional_active: true
        })),
        close: jest.fn()
      };

      superScrapingAgent.browser = {
        newPage: jest.fn(() => Promise.resolve(mockPage))
      };

      const product = await superScrapingAgent.scrapeProductDetails('HM-MARKET123');
      
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('pricing_analysis');
      expect(product).toHaveProperty('social_proof');
      expect(product).toHaveProperty('viability_score');
      expect(product.pricing_analysis.discount_percentage).toBeGreaterThan(0);
      expect(product.viability_score).toBeGreaterThanOrEqual(0);
      expect(product.viability_score).toBeLessThanOrEqual(100);
    });
  });

  describe('analyzeMarketViability', () => {
    it('should analyze market viability for products', async () => {
      const products = [
        {
          name: 'Python Course',
          price: 97.00,
          rating: 4.7,
          students: 3000,
          niche: 'Technology'
        },
        {
          name: 'Yoga Course',
          price: 47.00,
          rating: 4.5,
          students: 1200,
          niche: 'Health & Fitness'
        }
      ];

      const analysis = await superScrapingAgent.analyzeMarketViability(products);
      
      expect(analysis).toHaveProperty('market_overview');
      expect(analysis).toHaveProperty('opportunities');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis.market_overview).toHaveProperty('average_price');
      expect(analysis.market_overview).toHaveProperty('competition_level');
      expect(analysis.opportunities.length).toBeGreaterThan(0);
    });

    it('should identify trending niches', async () => {
      const historicalData = [
        { niche: 'Technology', growth_rate: 15.2, demand_score: 8.5 },
        { niche: 'Finance', growth_rate: 12.8, demand_score: 7.9 },
        { niche: 'Health', growth_rate: 8.5, demand_score: 6.2 }
      ];

      const trends = await superScrapingAgent.identifyTrends(historicalData);
      
      expect(trends).toHaveProperty('trending_niches');
      expect(trends).toHaveProperty('emerging_topics');
      expect(trends.trending_niches[0].niche).toBe('Technology');
      expect(trends.trending_niches[0].growth_score).toBeGreaterThan(0);
    });
  });

  describe('monitorCompetition', () => {
    it('should monitor competitor activities', async () => {
      const competitors = [
        { name: 'Competitor A', hotmart_id: 'HM-COMP1' },
        { name: 'Competitor B', hotmart_id: 'HM-COMP2' }
      ];

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ hotmart_id: 'HM-COMP1', current_price: 97.00 }] })
        .mockResolvedValueOnce({ rows: [{ hotmart_id: 'HM-COMP2', current_price: 147.00 }] });

      const monitoring = await superScrapingAgent.monitorCompetition(competitors);
      
      expect(monitoring).toHaveProperty('competitors');
      expect(monitoring).toHaveProperty('market_changes');
      expect(monitoring).toHaveProperty('opportunities');
      expect(monitoring.competitors.length).toBe(2);
      expect(monitoring.market_changes.price_changes).toBeDefined();
    });

    it('should detect price changes and promotions', async () => {
      const competitorData = {
        current_price: 97.00,
        previous_price: 147.00,
        promotional_active: true
      };

      const alert = await superScrapingAgent.detectPriceChange(competitorData);
      
      expect(alert).toHaveProperty('type', 'price_drop');
      expect(alert).toHaveProperty('percentage_change');
      expect(alert).toHaveProperty('recommendation');
      expect(alert.percentage_change).toBeGreaterThan(30);
    });
  });

  describe('affiliateOpportunityAnalysis', () => {
    it('should analyze affiliate potential', async () => {
      const product = {
        name: 'High-Ticket Course',
        price: 497.00,
        commission_rate: 50,
        conversion_rate: 3.2,
        refund_rate: 5.1,
        niche: 'Business'
      };

      const analysis = await superScrapingAgent.analyzeAffiliateOpportunity(product);
      
      expect(analysis).toHaveProperty('opportunity_score');
      expect(analysis).toHaveProperty('estimated_monthly_revenue');
      expect(analysis).toHaveProperty('risk_factors');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis.opportunity_score).toBeGreaterThanOrEqual(0);
      expect(analysis.opportunity_score).toBeLessThanOrEqual(100);
      expect(analysis.estimated_monthly_revenue).toBeGreaterThan(0);
    });

    it('should calculate expected ROI', async () => {
      const metrics = {
        initial_investment: 500, // Ad spend
        product_price: 97.00,
        commission_rate: 40,
        expected_conversions: 15,
        operational_costs: 100
      };

      const roi = await superScrapingAgent.calculateROI(metrics);
      
      expect(roi).toHaveProperty('revenue');
      expect(roi).toHaveProperty('profit');
      expect(roi).toHaveProperty('roi_percentage');
      expect(roi).toHaveProperty('break_even_conversions');
      expect(roi.roi_percentage).toBeGreaterThan(0);
      expect(roi.profit).toBeGreaterThan(0);
    });
  });

  describe('dataQualityAndValidation', () => {
    it('should validate scraped data quality', async () => {
      const scrapedData = [
        { name: 'Valid Product', price: 97.00, rating: 4.5, hotmart_id: 'HM-VALID123' },
        { name: '', price: -50, rating: 10, hotmart_id: 'INVALID' } // Invalid data
      ];

      const validation = await superScrapingAgent.validateData(scrapedData);
      
      expect(validation).toHaveProperty('valid_products');
      expect(validation).toHaveProperty('invalid_products');
      expect(validation).toHaveProperty('quality_score');
      expect(validation.valid_products.length).toBe(1);
      expect(validation.invalid_products.length).toBe(1);
      expect(validation.quality_score).toBeGreaterThanOrEqual(0);
      expect(validation.quality_score).toBeLessThanOrEqual(100);
    });

    it('should handle missing or incomplete data', async () => {
      const incompleteData = {
        name: 'Incomplete Product',
        // Missing price, rating, etc.
      };

      const completion = await superScrapingAgent.enrichData(incompleteData);
      
      expect(completion).toHaveProperty('enriched_data');
      expect(completion).toHaveProperty('confidence_score');
      expect(completion.enriched_data.price).toBeDefined();
      expect(completion.confidence_score).toBeGreaterThan(0);
    });
  });

  describe('errorHandling', () => {
    it('should handle network errors gracefully', async () => {
      superScrapingAgent.browser = {
        newPage: jest.fn(() => Promise.reject(new Error('Network timeout')))
      };

      const result = await superScrapingAgent.scrapeHotmartProducts('test', 5);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network');
      expect(result.retry_recommendation).toBeDefined();
    });

    it('should rotate user agents and proxies', async () => {
      const initialUserAgent = superScrapingAgent.currentUserAgent;
      
      await superScrapingAgent.rotateHeaders();
      
      expect(superScrapingAgent.currentUserAgent).not.toBe(initialUserAgent);
      expect(superScrapingAgent.userAgents).toContain(superScrapingAgent.currentUserAgent);
    });
  });

  describe('stop', () => {
    it('should cleanup resources gracefully', async () => {
      const closeSpy = jest.fn();
      superScrapingAgent.browser = { close: closeSpy };
      
      await superScrapingAgent.stop();
      
      expect(closeSpy).toHaveBeenCalled();
      expect(superScrapingAgent.status).toBe('inactive');
    });
  });
});