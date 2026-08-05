import { jest } from '@jest/globals';
import { Pool } from 'pg';

describe('Database Operations', () => {
  let pool;
  let client;

  beforeEach(async () => {
    // Create test database connection
    pool = new Pool({
      user: process.env.DB_USER || 'test_user',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'test_hotmart',
      password: process.env.DB_PASSWORD || 'test_password',
      port: 5432,
    });

    client = await pool.connect();
  });

  afterEach(async () => {
    // Clean up test data
    await client.query('DELETE FROM products WHERE hotmart_id LIKE $1', ['HM-TEST%']);
    await client.query('DELETE FROM daily_metrics WHERE product_id IN (SELECT id FROM products WHERE hotmart_id LIKE $1)', ['HM-TEST%']);
    await client.query('DELETE FROM generated_content WHERE title LIKE $1', ['Test%']);
    
    await client.release();
    await pool.end();
  });

  describe('Product Operations', () => {
    test('should create a new product', async () => {
      const productData = {
        hotmart_id: 'HM-TEST001',
        name: 'Test Database Course',
        niche: 'Technology',
        url_sales_page: 'https://pay.hotmart.com/RTEST001',
        description: 'A comprehensive test course for database operations'
      };

      const result = await client.query(
        `INSERT INTO products (hotmart_id, name, niche, url_sales_page, description, status, affiliate_commission) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [productData.hotmart_id, productData.name, productData.niche, productData.url_sales_page, productData.description, 'testing', 40.0]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBeDefined();
      expect(typeof result.rows[0].id).toBe('number');

      // Verify product was inserted correctly
      const verifyResult = await client.query('SELECT * FROM products WHERE hotmart_id = $1', [productData.hotmart_id]);
      expect(verifyResult.rows).toHaveLength(1);
      expect(verifyResult.rows[0].name).toBe(productData.name);
      expect(verifyResult.rows[0].niche).toBe(productData.niche);
      expect(verifyResult.rows[0].status).toBe('testing');
    });

    test('should enforce unique hotmart_id constraint', async () => {
      const hotmartId = 'HM-TEST002';
      
      // Insert first product
      await client.query(
        'INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4)',
        [hotmartId, 'First Product', 'Technology', 'testing']
      );

      // Attempt to insert duplicate
      await expect(
        client.query(
          'INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4)',
          [hotmartId, 'Duplicate Product', 'Business', 'testing']
        )
      ).rejects.toThrow('duplicate key value violates unique constraint');
    });

    test('should update product status', async () => {
      // Insert test product
      const insertResult = await client.query(
        'INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['HM-TEST003', 'Status Test Product', 'Technology', 'testing']
      );
      const productId = insertResult.rows[0].id;

      // Update status
      await client.query(
        'UPDATE products SET status = $1, reactivated_at = NOW() WHERE id = $2',
        ['active', productId]
      );

      // Verify update
      const result = await client.query('SELECT status, reactivated_at FROM products WHERE id = $1', [productId]);
      expect(result.rows[0].status).toBe('active');
      expect(result.rows[0].reactivated_at).toBeDefined();
    });

    test('should handle product selection for tracking', async () => {
      // Insert test product
      const insertResult = await client.query(
        'INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['HM-TEST004', 'Selection Test Product', 'Technology', 'testing']
      );
      const productId = insertResult.rows[0].id;

      // Select for tracking
      await client.query(
        'UPDATE products SET selected_for_tracking = $1 WHERE id = $2',
        [true, productId]
      );

      // Verify selection
      const result = await client.query('SELECT selected_for_tracking FROM products WHERE id = $1', [productId]);
      expect(result.rows[0].selected_for_tracking).toBe(true);
    });

    test('should calculate and update product scores', async () => {
      // Insert test product
      const insertResult = await client.query(
        'INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['HM-TEST005', 'Score Test Product', 'Technology', 'testing']
      );
      const productId = insertResult.rows[0].id;

      // Initialize score
      await client.query(
        'INSERT INTO product_scores (product_id, mean_prob, confidence) VALUES ($1, $2, $3)',
        [productId, 50.0, 0.8]
      );

      // Update score based on metrics
      const newScore = 75.5;
      await client.query(
        'UPDATE product_scores SET mean_prob = $1, last_calculated_at = NOW() WHERE product_id = $2',
        [newScore, productId]
      );

      // Verify score update
      const result = await client.query('SELECT mean_prob FROM product_scores WHERE product_id = $1', [productId]);
      expect(result.rows[0].mean_prob).toBe(newScore);
    });
  });

  describe('Metrics Operations', () => {
    test('should insert daily metrics', async () => {
      // Insert test product first
      const insertResult = await client.query(
        'INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['HM-TEST006', 'Metrics Test Product', 'Technology', 'testing']
      );
      const productId = insertResult.rows[0].id;

      // Insert metrics
      const metricsData = {
        product_id: productId,
        sales_count: 25,
        click_out_count: 150,
        social_views: 500,
        refund_count: 2,
        revenue: 2425.00,
        date: new Date()
      };

      const result = await client.query(
        `INSERT INTO daily_metrics (product_id, sales_count, click_out_count, social_views, refund_count, revenue, date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [metricsData.product_id, metricsData.sales_count, metricsData.click_out_count, metricsData.social_views, metricsData.refund_count, metricsData.revenue, metricsData.date]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBeDefined();

      // Verify metrics were inserted
      const verifyResult = await client.query('SELECT * FROM daily_metrics WHERE product_id = $1', [productId]);
      expect(verifyResult.rows).toHaveLength(1);
      expect(verifyResult.rows[0].sales_count).toBe(25);
      expect(verifyResult.rows[0].click_out_count).toBe(150);
    });

    test('should aggregate metrics for time periods', async () => {
      // Insert test product
      const insertResult = await client.query(
        'INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['HM-TEST007', 'Aggregation Test Product', 'Technology', 'testing']
      );
      const productId = insertResult.rows[0].id;

      // Insert multiple days of metrics
      const baseDate = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        
        await client.query(
          `INSERT INTO daily_metrics (product_id, sales_count, click_out_count, social_views, refund_count, revenue, date) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [productId, 10 + i, 50 + i * 10, 200 + i * 20, 1, 970 + i * 97, date]
        );
      }

      // Aggregate weekly metrics
      const aggregateResult = await client.query(
        `SELECT 
           SUM(sales_count) as total_sales,
           SUM(click_out_count) as total_clicks,
           SUM(social_views) as total_views,
           SUM(refund_count) as total_refunds,
           SUM(revenue) as total_revenue,
           COUNT(*) as days_tracked
         FROM daily_metrics 
         WHERE product_id = $1 AND date >= $2`,
        [productId, new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000)]
      );

      const aggregated = aggregateResult.rows[0];
      expect(parseInt(aggregated.total_sales)).toBeGreaterThan(0);
      expect(parseInt(aggregated.total_clicks)).toBeGreaterThan(0);
      expect(parseInt(aggregated.days_tracked)).toBe(7);
    });

    test('should calculate conversion rates from metrics', async () => {
      // Insert test product
      const insertResult = await client.query(
        'INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['HM-TEST008', 'Conversion Test Product', 'Technology', 'testing']
      );
      const productId = insertResult.rows[0].id;

      // Insert metrics with known conversion data
      await client.query(
        `INSERT INTO daily_metrics (product_id, sales_count, click_out_count, social_views, date) 
         VALUES ($1, $2, $3, $4, $5)`,
        [productId, 20, 200, 1000, new Date()]
      );

      // Calculate conversion rates
      const result = await client.query(
        `SELECT 
           sales_count::float / NULLIF(click_out_count, 0) as click_conversion_rate,
           sales_count::float / NULLIF(social_views, 0) * 100 as view_conversion_rate
         FROM daily_metrics 
         WHERE product_id = $1`,
        [productId]
      );

      const metrics = result.rows[0];
      expect(metrics.click_conversion_rate).toBe(0.1); // 20/200
      expect(metrics.view_conversion_rate).toBe(2.0); // 20/1000 * 100
    });
  });

  describe('Content Generation Operations', () => {
    test('should insert generated content', async () => {
      const contentData = {
        content_type: 'instagram_post',
        title: 'Test Instagram Post',
        content: 'This is a test Instagram post content with hashtags #test #post',
        platform: 'instagram',
        agent_name: 'SuperContentAgent',
        product_id: null,
        status: 'draft'
      };

      const result = await client.query(
        `INSERT INTO generated_content (content_type, title, content, platform, agent_name, product_id, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at`,
        [contentData.content_type, contentData.title, contentData.content, contentData.platform, contentData.agent_name, contentData.product_id, contentData.status]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBeDefined();
      expect(result.rows[0].created_at).toBeDefined();

      // Verify content was inserted
      const verifyResult = await client.query('SELECT * FROM generated_content WHERE id = $1', [result.rows[0].id]);
      expect(verifyResult.rows[0].title).toBe(contentData.title);
      expect(verifyResult.rows[0].platform).toBe(contentData.platform);
      expect(verifyResult.rows[0].status).toBe('draft');
    });

    test('should update content status', async () => {
      // Insert test content
      const insertResult = await client.query(
        `INSERT INTO generated_content (content_type, title, content, platform, agent_name, status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ['blog_post', 'Test Blog', 'Test content', 'blog', 'SuperContentAgent', 'draft']
      );
      const contentId = insertResult.rows[0].id;

      // Update status to published
      await client.query(
        'UPDATE generated_content SET status = $1, published_at = NOW() WHERE id = $2',
        ['published', contentId]
      );

      // Verify update
      const result = await client.query('SELECT status, published_at FROM generated_content WHERE id = $1', [contentId]);
      expect(result.rows[0].status).toBe('published');
      expect(result.rows[0].published_at).toBeDefined();
    });

    test('should query content by agent and platform', async () => {
      // Insert multiple content items
      await client.query(
        `INSERT INTO generated_content (content_type, title, content, platform, agent_name, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['instagram_post', 'IG Post 1', 'Content 1', 'instagram', 'SuperContentAgent', 'published']
      );
      await client.query(
        `INSERT INTO generated_content (content_type, title, content, platform, agent_name, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['tiktok_video', 'TT Video 1', 'Content 2', 'tiktok', 'SuperContentAgent', 'published']
      );
      await client.query(
        `INSERT INTO generated_content (content_type, title, content, platform, agent_name, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['email_campaign', 'Email 1', 'Content 3', 'email', 'SuperContentAgent', 'draft']
      );

      // Query by agent and platform
      const result = await client.query(
        'SELECT * FROM generated_content WHERE agent_name = $1 AND platform = $2 ORDER BY created_at DESC',
        ['SuperContentAgent', 'instagram']
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].platform).toBe('instagram');
      expect(result.rows[0].agent_name).toBe('SuperContentAgent');
    });
  });

  describe('Agent Status Operations', () => {
    test('should update agent status and activity', async () => {
      const agentName = 'TestAgent';
      const currentTask = 'Running test operation';

      // Insert or update agent status
      await client.query(
        `INSERT INTO agent_status (agent_name, status, current_task, last_activity) 
         VALUES ($1, $2, $3, NOW()) 
         ON CONFLICT (agent_name) DO UPDATE SET 
           status = EXCLUDED.status,
           current_task = EXCLUDED.current_task,
           last_activity = NOW()`,
        [agentName, 'active', currentTask]
      );

      // Verify agent status
      const result = await client.query('SELECT * FROM agent_status WHERE agent_name = $1', [agentName]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe('active');
      expect(result.rows[0].current_task).toBe(currentTask);
      expect(result.rows[0].last_activity).toBeDefined();
    });

    test('should track agent performance metrics', async () => {
      const agentName = 'PerformanceTestAgent';
      const performanceMetrics = {
        tasks_completed: 150,
        success_rate: 0.95,
        avg_response_time: 1.2,
        error_count: 5
      };

      // Update agent with performance metrics
      await client.query(
        `UPDATE agent_status 
         SET performance_metrics = $1, 
             last_activity = NOW() 
         WHERE agent_name = $2`,
        [JSON.stringify(performanceMetrics), agentName]
      );

      // Verify performance metrics
      const result = await client.query('SELECT performance_metrics FROM agent_status WHERE agent_name = $1', [agentName]);
      expect(result.rows).toHaveLength(1);
      
      const metrics = JSON.parse(result.rows[0].performance_metrics);
      expect(metrics.tasks_completed).toBe(150);
      expect(metrics.success_rate).toBe(0.95);
    });
  });

  describe('Knowledge Base Operations', () => {
    test('should store and retrieve knowledge entries', async () => {
      const knowledgeData = {
        source: 'Test Tutorial',
        content: 'This is test knowledge content about machine learning and data science',
        tags: { topic: 'machine_learning', type: 'tutorial', difficulty: 'intermediate' }
      };

      // Insert knowledge
      const result = await client.query(
        `INSERT INTO knowledge_base (source, content, tags, created_at) 
         VALUES ($1, $2, $3, NOW()) RETURNING id`,
        [knowledgeData.source, knowledgeData.content, JSON.stringify(knowledgeData.tags)]
      );

      expect(result.rows).toHaveLength(1);
      const knowledgeId = result.rows[0].id;

      // Retrieve knowledge
      const retrieveResult = await client.query('SELECT * FROM knowledge_base WHERE id = $1', [knowledgeId]);
      expect(retrieveResult.rows).toHaveLength(1);
      expect(retrieveResult.rows[0].source).toBe(knowledgeData.source);
      expect(retrieveResult.rows[0].content).toBe(knowledgeData.content);

      const tags = JSON.parse(retrieveResult.rows[0].tags);
      expect(tags.topic).toBe('machine_learning');
    });

    test('should search knowledge by content', async () => {
      // Insert multiple knowledge entries
      await client.query(
        `INSERT INTO knowledge_base (source, content, tags) VALUES ($1, $2, $3)`,
        ['AI Tutorial', 'Learn about artificial intelligence and neural networks', '{"topic": "ai", "type": "tutorial"}']
      );
      await client.query(
        `INSERT INTO knowledge_base (source, content, tags) VALUES ($1, $2, $3)`,
        ['ML Guide', 'Comprehensive guide to machine learning algorithms', '{"topic": "machine_learning", "type": "guide"}']
      );

      // Search for knowledge containing "machine learning"
      const searchResult = await client.query(
        "SELECT * FROM knowledge_base WHERE content ILIKE $1 ORDER BY created_at DESC",
        ['%machine learning%']
      );

      expect(searchResult.rows.length).toBeGreaterThan(0);
      searchResult.rows.forEach(row => {
        expect(row.content.toLowerCase()).toContain('machine learning');
      });
    });
  });

  describe('System Settings Operations', () => {
    test('should manage menu configuration', async () => {
      const menuItem = {
        id: 'test_menu_item',
        label: 'Test Menu',
        path: '/test',
        sort_order: 100,
        is_default: false
      };

      // Insert menu item
      await client.query(
        `INSERT INTO system_menu (id, label, path, sort_order, is_default) 
         VALUES ($1, $2, $3, $4, $5)`,
        [menuItem.id, menuItem.label, menuItem.path, menuItem.sort_order, menuItem.is_default]
      );

      // Retrieve menu
      const result = await client.query('SELECT * FROM system_menu WHERE id = $1', [menuItem.id]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].label).toBe(menuItem.label);
      expect(result.rows[0].path).toBe(menuItem.path);
    });

    test('should store API keys securely', async () => {
      const apiKeyData = {
        name: 'Test API Key',
        platform: 'test_platform',
        encrypted_key: 'encrypted_test_key_12345',
        is_active: true
      };

      // Insert API key
      const result = await client.query(
        `INSERT INTO api_keys (name, platform, encrypted_key, is_active, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
        [apiKeyData.name, apiKeyData.platform, apiKeyData.encrypted_key, apiKeyData.is_active]
      );

      expect(result.rows).toHaveLength(1);
      const keyId = result.rows[0].id;

      // Retrieve API key (without exposing the actual key in tests)
      const retrieveResult = await client.query(
        'SELECT id, name, platform, is_active FROM api_keys WHERE id = $1',
        [keyId]
      );
      expect(retrieveResult.rows).toHaveLength(1);
      expect(retrieveResult.rows[0].name).toBe(apiKeyData.name);
      expect(retrieveResult.rows[0].platform).toBe(apiKeyData.platform);
      expect(retrieveResult.rows[0].is_active).toBe(true);
    });
  });

  describe('Data Integrity and Constraints', () => {
    test('should enforce foreign key constraints', async () => {
      // Try to insert metrics for non-existent product
      await expect(
        client.query(
          'INSERT INTO daily_metrics (product_id, sales_count, date) VALUES ($1, $2, $3)',
          [99999, 10, new Date()] // Non-existent product ID
        )
      ).rejects.toThrow(); // Should fail due to foreign key constraint
    });

    test('should handle NULL values appropriately', async () => {
      // Insert product with optional fields as NULL
      const result = await client.query(
        `INSERT INTO products (hotmart_id, name, niche, status, description, affiliate_url) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ['HM-TEST009', 'NULL Test Product', 'Technology', 'testing', null, null]
      );

      expect(result.rows).toHaveLength(1);
      
      // Verify NULL values are handled
      const verifyResult = await client.query('SELECT description, affiliate_url FROM products WHERE id = $1', [result.rows[0].id]);
      expect(verifyResult.rows[0].description).toBeNull();
      expect(verifyResult.rows[0].affiliate_url).toBeNull();
    });

    test('should validate data types and ranges', async () => {
      // Insert product with valid commission rate
      await client.query(
        'INSERT INTO products (hotmart_id, name, niche, status, affiliate_commission) VALUES ($1, $2, $3, $4, $5)',
        ['HM-TEST010', 'Validation Test', 'Technology', 'testing', 45.5]
      );

      // Try to insert with invalid commission rate (negative)
      await expect(
        client.query(
          'INSERT INTO products (hotmart_id, name, niche, status, affiliate_commission) VALUES ($1, $2, $3, $4, $5)',
          ['HM-TEST011', 'Invalid Commission', 'Technology', 'testing', -10.0]
        )
      ).rejects.toThrow(); // Should fail due to check constraint if implemented
    });
  });

  describe('Transaction Management', () => {
    test('should rollback on error', async () => {
      await client.query('BEGIN');

      try {
        // Insert product
        const productResult = await client.query(
          'INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4) RETURNING id',
          ['HM-TEST012', 'Transaction Test', 'Technology', 'testing']
        );
        const productId = productResult.rows[0].id;

        // Insert metrics
        await client.query(
          'INSERT INTO daily_metrics (product_id, sales_count, date) VALUES ($1, $2, $3)',
          [productId, 15, new Date()]
        );

        // Intentionally cause an error
        await client.query('INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4)', 
          [null, null, null, null]); // This should fail

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        
        // Verify rollback worked - product should not exist
        const result = await client.query('SELECT COUNT(*) FROM products WHERE hotmart_id = $1', ['HM-TEST012']);
        expect(parseInt(result.rows[0].count)).toBe(0);
      }
    });

    test('should commit successful transaction', async () => {
      await client.query('BEGIN');

      try {
        // Insert product
        const productResult = await client.query(
          'INSERT INTO products (hotmart_id, name, niche, status) VALUES ($1, $2, $3, $4) RETURNING id',
          ['HM-TEST013', 'Success Transaction', 'Technology', 'testing']
        );
        const productId = productResult.rows[0].id;

        // Insert metrics
        await client.query(
          'INSERT INTO daily_metrics (product_id, sales_count, date) VALUES ($1, $2, $3)',
          [productId, 25, new Date()]
        );

        await client.query('COMMIT');

        // Verify commit worked - both records should exist
        const productCheck = await client.query('SELECT COUNT(*) FROM products WHERE hotmart_id = $1', ['HM-TEST013']);
        expect(parseInt(productCheck.rows[0].count)).toBe(1);

        const metricsCheck = await client.query('SELECT COUNT(*) FROM daily_metrics WHERE product_id = $1', [productId]);
        expect(parseInt(metricsCheck.rows[0].count)).toBe(1);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    });
  });
});