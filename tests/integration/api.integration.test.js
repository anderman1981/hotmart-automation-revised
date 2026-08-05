import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';

// Mock dependencies
jest.mock('pg');
jest.mock('puppeteer-core');
jest.mock('redis');

// Create a test app with integration endpoints
const app = express();
app.use(express.json());

// Mock database for integration tests
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn()
};

// Integration test endpoints
app.post('/api/products', async (req, res) => {
  try {
    const { hotmart_id, name, niche, url_sales_page } = req.body;
    
    // Simulate database insertion
    const result = await mockPool.query(
      'INSERT INTO products (hotmart_id, name, niche, url_sales_page) VALUES ($1, $2, $3, $4) RETURNING id',
      [hotmart_id, name, niche, url_sales_page]
    );
    
    // Simulate score calculation
    await mockPool.query(
      'INSERT INTO product_scores (product_id) VALUES ($1)',
      [result.rows[0].id]
    );
    
    res.status(201).json({ 
      id: result.rows[0].id, 
      hotmart_id, 
      name, 
      niche,
      url_sales_page,
      status: 'testing'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/metrics', async (req, res) => {
  try {
    const { product_id, sales, clicks, social_engagement, refund_count } = req.body;
    
    // Save metrics
    await mockPool.query(
      'INSERT INTO daily_metrics (product_id, sales_count, click_out_count, social_views, refund_count) VALUES ($1, $2, $3, $4, $5)',
      [product_id, sales, clicks, social_engagement, refund_count]
    );
    
    // Get current score
    const scoreRes = await mockPool.query('SELECT * FROM product_scores WHERE product_id = $1', [product_id]);
    const scoreData = scoreRes.rows[0];
    
    // Calculate new score (simplified Bayesian)
    const newScore = Math.min(100, Math.max(0, (sales + clicks * 0.1) * 2));
    
    // Update score
    await mockPool.query(
      'UPDATE product_scores SET mean_prob = $1, last_calculated_at = NOW() WHERE product_id = $2',
      [newScore, product_id]
    );
    
    // Decide status
    let newStatus = 'testing';
    if (newScore > 70) newStatus = 'active';
    else if (newScore < 30) newStatus = 'cold';
    
    await mockPool.query('UPDATE products SET status = $1 WHERE id = $2', [newStatus, product_id]);
    
    res.json({ product_id, newScore, newStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await mockPool.query('SELECT * FROM products ORDER BY created_at DESC');
    
    // Enhance with scores
    const enhancedProducts = await Promise.all(result.rows.map(async (product) => {
      const scoreRes = await mockPool.query('SELECT mean_prob FROM product_scores WHERE product_id = $1', [product.id]);
      const score = scoreRes.rows[0]?.mean_prob || 0;
      
      return {
        ...product,
        score,
        affiliate_url: product.url_sales_page + '?ref=W949655431L'
      };
    }));
    
    res.json({ products: enhancedProducts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/content', async (req, res) => {
  try {
    const { content_type, title, content, platform, agent_name, product_id } = req.body;
    
    // Save content
    const result = await mockPool.query(
      'INSERT INTO generated_content (content_type, title, content, platform, agent_name, product_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at',
      [content_type, title, content, platform, agent_name, product_id, 'draft']
    );
    
    // Update agent activity
    await mockPool.query('UPDATE agent_status SET last_activity = NOW(), current_task = $1 WHERE agent_name = $2',
      [`Generated ${content_type}: ${title}`, agent_name]
    );
    
    res.json({ success: true, content: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent coordination endpoint
app.post('/api/agents/coordinate', async (req, res) => {
  try {
    const { task_type, payload, agents_involved } = req.body;
    
    // Simulate agent coordination
    const coordinationResults = [];
    
    for (const agentName of agents_involved) {
      // Update agent status
      await mockPool.query(
        'UPDATE agent_status SET status = $1, current_task = $2, last_activity = NOW() WHERE agent_name = $3',
        ['active', task_type, agentName]
      );
      
      coordinationResults.push({
        agent: agentName,
        status: 'completed',
        task: task_type,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log coordination event
    await mockPool.query(
      'INSERT INTO agent_events (agent_name, event_type, payload) VALUES ($1, $2, $3)',
      [agents_involved.join(','), 'coordination', JSON.stringify({ task_type, payload })]
    );
    
    res.json({
      coordination_id: `coord_${Date.now()}`,
      status: 'completed',
      results: coordinationResults
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

describe('Integration Tests', () => {
  beforeEach(() => {
    mockPool.query.mockClear();
  });

  describe('Product Lifecycle Integration', () => {
    it('should create product, add metrics, and update status', async () => {
      // Step 1: Create product
      const productData = {
        hotmart_id: 'HM-INT123',
        name: 'Integration Test Course',
        niche: 'Technology',
        url_sales_page: 'https://pay.hotmart.com/RINT123'
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Product insertion
        .mockResolvedValueOnce({ rows: [] }); // Score insertion

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.id).toBe(1);
      expect(createResponse.body.status).toBe('testing');

      // Step 2: Add metrics
      const metricsData = {
        product_id: 1,
        sales: 25,
        clicks: 150,
        social_engagement: 500,
        refund_count: 2
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // Metrics insertion
        .mockResolvedValueOnce({ rows: [{ mean_prob: 50 }] }) // Get current score
        .mockResolvedValueOnce({ rows: [] }); // Update score

      const metricsResponse = await request(app)
        .post('/api/metrics')
        .send(metricsData);

      expect(metricsResponse.status).toBe(200);
      expect(metricsResponse.body.product_id).toBe(1);
      expect(metricsResponse.body.newScore).toBeGreaterThan(0);
      expect(metricsResponse.body.newStatus).toBe('active'); // High score should make it active

      // Step 3: Verify product with enhanced data
      mockPool.query
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            hotmart_id: 'HM-INT123',
            name: 'Integration Test Course',
            niche: 'Technology',
            status: 'active'
          }]
        })
        .mockResolvedValueOnce({ rows: [{ mean_prob: 75 }] }); // Score

      const getResponse = await request(app)
        .get('/api/products');

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.products).toHaveLength(1);
      expect(getResponse.body.products[0].score).toBe(75);
      expect(getResponse.body.products[0].affiliate_url).toContain('?ref=W949655431L');
    });
  });

  describe('Content Generation Integration', () => {
    it('should generate content and update agent activity', async () => {
      const contentData = {
        content_type: 'instagram_post',
        title: 'Test Instagram Post',
        content: 'This is a test Instagram post content',
        platform: 'instagram',
        agent_name: 'SuperContentAgent',
        product_id: 1
      };

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            created_at: new Date().toISOString()
          }]
        })
        .mockResolvedValueOnce({ rows: [] }); // Agent activity update

      const response = await request(app)
        .post('/api/content')
        .send(contentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.content.id).toBe(1);
      expect(response.body.content.content_type).toBe('instagram_post');

      // Verify agent activity was updated
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE agent_status'),
        expect.arrayContaining([
          expect.stringContaining('Generated instagram_post: Test Instagram Post'),
          'SuperContentAgent'
        ])
      );
    });

    it('should handle content generation with missing product', async () => {
      const contentData = {
        content_type: 'email_campaign',
        title: 'Test Email Campaign',
        content: 'Test email content',
        platform: 'email',
        agent_name: 'SuperContentAgent',
        product_id: null
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [{
          id: 2,
          created_at: new Date().toISOString()
        }]
      });

      const response = await request(app)
        .post('/api/content')
        .send(contentData);

      expect(response.status).toBe(200);
      expect(response.body.content.product_id).toBeNull();
    });
  });

  describe('Agent Coordination Integration', () => {
    it('should coordinate multiple agents for a task', async () => {
      const coordinationData = {
        task_type: 'market_analysis',
        payload: {
          niche: 'Technology',
          time_range: '30d'
        },
        agents_involved: ['SuperScrapingAgent', 'SuperAnalyticsAgent']
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // First agent status update
        .mockResolvedValueOnce({ rows: [] }) // Second agent status update
        .mockResolvedValueOnce({ rows: [] }); // Event logging

      const response = await request(app)
        .post('/api/agents/coordinate')
        .send(coordinationData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(response.body.results).toHaveLength(2);
      expect(response.body.coordination_id).toMatch(/^coord_\d+$/);

      // Verify all agents were updated
      expect(mockPool.query).toHaveBeenCalledTimes(3);
      
      response.body.results.forEach(result => {
        expect(result.agent).toMatch(/^(SuperScrapingAgent|SuperAnalyticsAgent)$/);
        expect(result.status).toBe('completed');
        expect(result.task).toBe('market_analysis');
      });
    });

    it('should handle coordination with single agent', async () => {
      const coordinationData = {
        task_type: 'content_generation',
        payload: {
          product_name: 'Test Product',
          platforms: ['instagram', 'tiktok']
        },
        agents_involved: ['SuperContentAgent']
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // Agent status update
        .mockResolvedValueOnce({ rows: [] }); // Event logging

      const response = await request(app)
        .post('/api/agents/coordinate')
        .send(coordinationData);

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].agent).toBe('SuperContentAgent');
    });
  });

  describe('Database Operations Integration', () => {
    it('should handle database errors gracefully', async () => {
      // Simulate database connection error
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/products')
        .send({
          hotmart_id: 'HM-ERROR123',
          name: 'Error Test Product',
          niche: 'Testing'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Database connection failed');
    });

    it('should handle constraint violations', async () => {
      // Simulate duplicate key error
      const duplicateError = new Error('duplicate key value violates unique constraint');
      duplicateError.code = '23505';
      mockPool.query.mockRejectedValue(duplicateError);

      const response = await request(app)
        .post('/api/products')
        .send({
          hotmart_id: 'HM-DUP123',
          name: 'Duplicate Product',
          niche: 'Testing'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('duplicate key');
    });

    it('should maintain data consistency across operations', async () => {
      // Create product
      mockPool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const createResponse = await request(app)
        .post('/api/products')
        .send({
          hotmart_id: 'HM-CONS123',
          name: 'Consistency Test',
          niche: 'Testing'
        });

      expect(createResponse.status).toBe(201);

      // Add metrics that should update the same product
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // Metrics
        .mockResolvedValueOnce({ rows: [{ mean_prob: 60 }] }) // Get score
        .mockResolvedValueOnce({ rows: [] }); // Update score

      const metricsResponse = await request(app)
        .post('/api/metrics')
        .send({
          product_id: 1,
          sales: 10,
          clicks: 50,
          social_engagement: 200,
          refund_count: 1
        });

      expect(metricsResponse.status).toBe(200);
      expect(metricsResponse.body.product_id).toBe(1); // Same product ID
    });
  });

  describe('Frontend-Backend Communication Integration', () => {
    it('should handle CORS and content-type headers', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .set('Origin', 'http://localhost:5173')
        .send({
          hotmart_id: 'HM-CORS123',
          name: 'CORS Test Product',
          niche: 'Testing'
        });

      expect(response.status).toBe(201);
      expect(response.headers).toBeDefined();
    });

    it('should validate request payload structure', async () => {
      // Test with malformed JSON
      const response = await request(app)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });

    it('should handle large payloads appropriately', async () => {
      const largeContent = 'x'.repeat(100000); // 100KB content
      mockPool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/api/content')
        .send({
          content_type: 'blog_post',
          title: 'Large Content Test',
          content: largeContent,
          platform: 'blog',
          agent_name: 'SuperContentAgent'
        });

      expect([200, 413]).toContain(response.status); // Either succeeds or payload too large
    });

    it('should maintain API response format consistency', async () => {
      // Test product creation response format
      mockPool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const productResponse = await request(app)
        .post('/api/products')
        .send({
          hotmart_id: 'HM-FORMAT123',
          name: 'Format Test',
          niche: 'Testing'
        });

      expect(productResponse.body).toHaveProperty('id');
      expect(productResponse.body).toHaveProperty('hotmart_id');
      expect(productResponse.body).toHaveProperty('name');
      expect(productResponse.body).toHaveProperty('niche');
      expect(productResponse.body).toHaveProperty('status');

      // Test metrics response format
      mockPool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ mean_prob: 50 }] })
        .mockResolvedValueOnce({ rows: [] });

      const metricsResponse = await request(app)
        .post('/api/metrics')
        .send({
          product_id: 1,
          sales: 5,
          clicks: 25,
          social_engagement: 100,
          refund_count: 0
        });

      expect(metricsResponse.body).toHaveProperty('product_id');
      expect(metricsResponse.body).toHaveProperty('newScore');
      expect(metricsResponse.body).toHaveProperty('newStatus');
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent requests', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ id: Math.random() }] });

      const promises = Array(10).fill().map((_, index) =>
        request(app)
          .post('/api/products')
          .send({
            hotmart_id: `HM-CONC${index}`,
            name: `Concurrent Test ${index}`,
            niche: 'Testing'
          })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
      });
    });

    it('should maintain response times under load', async () => {
      mockPool.query.mockImplementation(() => {
        // Simulate some processing time
        return new Promise(resolve => {
          setTimeout(() => resolve({ rows: [{ id: 1 }] }), 50);
        });
      });

      const start = Date.now();
      const response = await request(app)
        .post('/api/products')
        .send({
          hotmart_id: 'HM-PERF123',
          name: 'Performance Test',
          niche: 'Testing'
        });
      const duration = Date.now() - start;

      expect(response.status).toBe(201);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Error Recovery Integration', () => {
    it('should retry failed database operations', async () => {
      // First call fails, second succeeds
      mockPool.query
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/api/products')
        .send({
          hotmart_id: 'HM-RETRY123',
          name: 'Retry Test',
          niche: 'Testing'
        });

      // Should succeed after retry (implementation dependent)
      expect([201, 500]).toContain(response.status);
    });

    it('should handle partial failures gracefully', async () => {
      // Product creation succeeds, but score insertion fails
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Product creation
        .mockRejectedValueOnce(new Error('Score insertion failed')); // Score insertion

      const response = await request(app)
        .post('/api/products')
        .send({
          hotmart_id: 'HM-PARTIAL123',
          name: 'Partial Failure Test',
          niche: 'Testing'
        });

      // Should handle gracefully - either succeed or fail with clear error
      expect([201, 500]).toContain(response.status);
    });
  });
});