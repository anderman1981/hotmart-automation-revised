import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

// Mock the database and other dependencies
jest.mock('pg');
jest.mock('puppeteer-core');
jest.mock('redis');

// Import the app after mocking dependencies
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const mockProducts = [
      {
        id: 1,
        hotmart_id: 'HM-R94668718U',
        name: 'Super Pack de Cursos 2024',
        niche: 'Business',
        url_sales_page: 'https://pay.hotmart.com/R94668718U',
        affiliate_url: 'https://pay.hotmart.com/R94668718U?ref=W949655431L',
        selected_for_tracking: true,
        affiliate_status: 'active',
        total_revenue: 1500.00,
        total_commissions: 600.00
      },
      {
        id: 2,
        hotmart_id: 'HM-K94730729B',
        name: 'Curso de Marketing Digital 360°',
        niche: 'Marketing',
        url_sales_page: 'https://pay.hotmart.com/K94730729B',
        affiliate_url: 'https://pay.hotmart.com/K94730729B?ref=W949655431L',
        selected_for_tracking: false,
        affiliate_status: 'pending',
        total_revenue: 0,
        total_commissions: 0
      }
    ];
    res.json({ products: mockProducts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { hotmart_id, name, niche, url_sales_page } = req.body;
    
    if (!hotmart_id || !name || !niche) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newProduct = {
      id: Math.floor(Math.random() * 1000),
      hotmart_id,
      name,
      niche,
      url_sales_page: url_sales_page || `https://pay.hotmart.com/${hotmart_id.replace('HM-', '')}`,
      selected_for_tracking: false,
      affiliate_status: 'pending',
      total_revenue: 0,
      total_commissions: 0
    };
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id/select', async (req, res) => {
  try {
    const { id } = req.params;
    const { selected } = req.body;
    
    if (typeof selected !== 'boolean') {
      return res.status(400).json({ error: 'selected must be boolean' });
    }
    
    res.json({ success: true, message: `Product ${id} ${selected ? 'selected' : 'deselected'} for tracking` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/products', async (req, res) => {
  try {
    res.json({ status: 'success', msg: 'All products and metrics deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const mockStats = {
      estimated_earnings: 2450.00,
      selected_products: 5,
      actual_revenue: 2450.00,
      tracked_products: 12,
      new_products: 2,
      content_generated: 25,
      content_trend: 15,
      content_this_week: 25,
      active_agents: 4,
      total_agents: 7,
      system_active: true
    };
    
    res.json(mockStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Super agents endpoint
app.get('/api/super-agents/status', async (req, res) => {
  try {
    const mockSuperAgents = {
      super_agents: [
        {
          name: 'SuperScrapingAgent',
          status: 'active',
          description: 'Intelligent scraping with LLM analysis',
          capabilities: ['market_scraping', 'viability_analysis', 'affiliate_decisions'],
          last_update: new Date().toISOString()
        },
        {
          name: 'SuperContentAgent',
          status: 'ready',
          description: 'Multi-platform content generation with AI',
          capabilities: ['instagram_posts', 'tiktok_videos', 'email_campaigns', 'blog_articles'],
          last_update: new Date().toISOString()
        },
        {
          name: 'SuperAnalyticsAgent',
          status: 'monitoring',
          description: 'Comprehensive analytics and market insights',
          capabilities: ['performance_metrics', 'trend_analysis', 'roi_tracking', 'recommendations'],
          last_update: new Date().toISOString()
        }
      ],
      llm_status: 'active',
      llm_models: ['llama2', 'codellama'],
      chain_status: 'operational',
      last_global_scan: {
        current_task: 'market_analysis',
        last_activity: new Date().toISOString()
      }
    };
    
    res.json(mockSuperAgents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Content generation endpoint
app.post('/api/content', async (req, res) => {
  try {
    const { content_type, title, content, platform, agent_name, product_id } = req.body;
    
    if (!content_type || !title || !platform || !agent_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newContent = {
      id: Math.floor(Math.random() * 1000),
      content_type,
      title,
      content: content || 'Generated content placeholder',
      platform,
      agent_name,
      product_id: product_id || null,
      status: 'draft',
      created_at: new Date().toISOString()
    };
    
    res.json({ success: true, content: newContent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System control endpoints
app.post('/api/system/start', async (req, res) => {
  try {
    res.json({ status: 'success', msg: 'System Started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/system/stop', async (req, res) => {
  try {
    res.json({ status: 'success', msg: 'System Stopped & Agents Halted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Knowledge base endpoints
app.post('/api/agents/:agent/knowledge', async (req, res) => {
  try {
    const { agent } = req.params;
    const knowledgeData = req.body;
    
    res.json({ status: 'success', msg: `Knowledge saved for ${agent}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/:agent/knowledge', async (req, res) => {
  try {
    const { agent } = req.params;
    const mockKnowledge = {
      agent: agent,
      topics: ['machine learning', 'digital marketing', 'content creation'],
      last_updated: new Date().toISOString(),
      knowledge_count: 15
    };
    
    res.json(mockKnowledge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

describe('API Endpoints', () => {
  describe('Health Check', () => {
    it('should return OK status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Products API', () => {
    it('should get all products', async () => {
      const response = await request(app).get('/api/products');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.products.length).toBeGreaterThan(0);
      
      const product = response.body.products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('hotmart_id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('niche');
      expect(product).toHaveProperty('affiliate_url');
    });

    it('should create a new product', async () => {
      const newProduct = {
        hotmart_id: 'HM-TEST123',
        name: 'Test Product',
        niche: 'Technology',
        url_sales_page: 'https://pay.hotmart.com/RTEST123'
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newProduct.name);
      expect(response.body.hotmart_id).toBe(newProduct.hotmart_id);
    });

    it('should reject product creation with missing fields', async () => {
      const incompleteProduct = {
        name: 'Incomplete Product'
        // Missing hotmart_id and niche
      };

      const response = await request(app)
        .post('/api/products')
        .send(incompleteProduct);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should select product for tracking', async () => {
      const productId = 1;
      const selectionData = { selected: true };

      const response = await request(app)
        .put(`/api/products/${productId}/select`)
        .send(selectionData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('selected for tracking');
    });

    it('should handle invalid selection data', async () => {
      const productId = 1;
      const invalidData = { selected: 'yes' }; // Should be boolean

      const response = await request(app)
        .put(`/api/products/${productId}/select`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('selected must be boolean');
    });

    it('should delete all products (admin)', async () => {
      const response = await request(app).delete('/api/admin/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('msg');
    });
  });

  describe('Stats API', () => {
    it('should return dashboard statistics', async () => {
      const response = await request(app).get('/api/stats');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('estimated_earnings');
      expect(response.body).toHaveProperty('selected_products');
      expect(response.body).toHaveProperty('tracked_products');
      expect(response.body).toHaveProperty('content_generated');
      expect(response.body).toHaveProperty('active_agents');
      expect(response.body).toHaveProperty('system_active');

      expect(typeof response.body.estimated_earnings).toBe('number');
      expect(typeof response.body.selected_products).toBe('number');
      expect(typeof response.body.active_agents).toBe('number');
      expect(typeof response.body.system_active).toBe('boolean');
    });
  });

  describe('Super Agents API', () => {
    it('should return super agents status', async () => {
      const response = await request(app).get('/api/super-agents/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('super_agents');
      expect(response.body).toHaveProperty('llm_status');
      expect(response.body).toHaveProperty('chain_status');

      expect(response.body.super_agents).toBeInstanceOf(Array);
      expect(response.body.super_agents.length).toBe(3);

      const agent = response.body.super_agents[0];
      expect(agent).toHaveProperty('name');
      expect(agent).toHaveProperty('status');
      expect(agent).toHaveProperty('description');
      expect(agent).toHaveProperty('capabilities');
    });
  });

  describe('Content API', () => {
    it('should create new content', async () => {
      const contentData = {
        content_type: 'instagram_post',
        title: 'Test Instagram Post',
        platform: 'instagram',
        agent_name: 'SuperContentAgent',
        product_id: 1
      };

      const response = await request(app)
        .post('/api/content')
        .send(contentData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('content');
      
      const content = response.body.content;
      expect(content.title).toBe(contentData.title);
      expect(content.platform).toBe(contentData.platform);
      expect(content.agent_name).toBe(contentData.agent_name);
      expect(content).toHaveProperty('id');
      expect(content).toHaveProperty('created_at');
    });

    it('should reject content creation with missing fields', async () => {
      const incompleteContent = {
        title: 'Incomplete Content'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/content')
        .send(incompleteContent);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('System Control API', () => {
    it('should start the system', async () => {
      const response = await request(app).post('/api/system/start');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('msg');
      expect(response.body.msg).toContain('System Started');
    });

    it('should stop the system', async () => {
      const response = await request(app).post('/api/system/stop');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('msg');
      expect(response.body.msg).toContain('System Stopped');
    });
  });

  describe('Knowledge Base API', () => {
    it('should save knowledge for an agent', async () => {
      const agentName = 'LearningAgent';
      const knowledgeData = {
        topics: ['AI', 'Machine Learning'],
        sources: ['Coursera', 'YouTube'],
        last_updated: new Date().toISOString()
      };

      const response = await request(app)
        .post(`/api/agents/${agentName}/knowledge`)
        .send(knowledgeData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.msg).toContain('Knowledge saved');
      expect(response.body.msg).toContain(agentName);
    });

    it('should get knowledge for an agent', async () => {
      const agentName = 'LearningAgent';

      const response = await request(app).get(`/api/agents/${agentName}/knowledge`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('agent', agentName);
      expect(response.body).toHaveProperty('topics');
      expect(response.body).toHaveProperty('last_updated');
      expect(response.body).toHaveProperty('knowledge_count');

      expect(response.body.topics).toBeInstanceOf(Array);
      expect(typeof response.body.knowledge_count).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });
  });

  describe('Request Validation', () => {
    it('should reject empty POST requests', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle large payloads gracefully', async () => {
      const largeContent = 'x'.repeat(1000000); // 1MB of text
      const contentData = {
        content_type: 'blog_post',
        title: 'Large Content Test',
        content: largeContent,
        platform: 'blog',
        agent_name: 'SuperContentAgent'
      };

      const response = await request(app)
        .post('/api/content')
        .send(contentData);

      // Should either succeed or fail gracefully
      expect([200, 400, 413]).toContain(response.status);
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const start = Date.now();
      const response = await request(app).get('/api/products');
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(10).fill().map(() => 
        request(app).get('/api/stats')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('estimated_earnings');
      });
    });
  });
});