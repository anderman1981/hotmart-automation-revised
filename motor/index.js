import 'dotenv/config';
import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import { createClient } from 'redis';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Redis Connection
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log('✅ Connected to Redis');
})();

// Global System State
let SYSTEM_ACTIVE = true;

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'Bayesian Engine Active 🚀', mode: process.env.NODE_ENV, system_active: SYSTEM_ACTIVE });
});

// --- Knowledge Base API ---
app.post('/api/agents/:agent/knowledge', (req, res) => {
    const { agent } = req.params;
    const knowledgeData = req.body;
    const agentName = agent.toLowerCase();
    
    // Ensure directory exists (redundant safety)
    const knowledgeDir = path.join(__dirname, 'data', 'knowledge');
    if (!fs.existsSync(knowledgeDir)) {
        fs.mkdirSync(knowledgeDir, { recursive: true });
    }
    
    const filePath = path.join(knowledgeDir, `${agentName}.json`);
    
    try {
        fs.writeFileSync(filePath, JSON.stringify(knowledgeData, null, 2));
        console.log(`🧠 Knowledge Base updated for ${agentName}`);
        
        // Optional: Trigger agent reload or notify agent
        if (agentName === 'git' && gitAgent) {
             // Future: gitAgent.loadKnowledge(knowledgeData);
        }

        res.json({ status: 'success', msg: `Knowledge saved for ${agentName}` });
    } catch (error) {
        console.error(`❌ Failed to save knowledge for ${agentName}:`, error);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

app.get('/api/agents/:agent/knowledge', (req, res) => {
    const { agent } = req.params;
    const agentName = agent.toLowerCase();
    const filePath = path.join(__dirname, 'data', 'knowledge', `${agentName}.json`);
    
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            res.json(JSON.parse(data));
        } catch (error) {
             res.status(500).json({ status: 'error', error: 'Corrupt knowledge file' });
        }
    } else {
        res.json({ status: 'empty', msg: 'No knowledge base found for this agent.' });
    }
});

// --- Agent Management Endpoints ---
app.post('/api/system/start', (req, res) => {
    SYSTEM_ACTIVE = true;
    // Logic to restart agents could go here
    console.log('🟢 SYSTEM STARTED');
    res.json({ status: 'success', msg: 'System Started' });
});

app.post('/api/system/stop', async (req, res) => {
    SYSTEM_ACTIVE = false;
    console.log('🔴 SYSTEM STOPPED');
    // Stop all agents
    try {
        await Promise.all([
            detectorAgent.stop(),
            instagramAgent.stop(),
            learningAgent.stop()
        ]);
        res.json({ status: 'success', msg: 'System Stopped & Agents Halted' });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

import bayesianEngine from './BayesianEngine/index.js';

// Ingest product for initial tracking
app.post('/api/products', async (req, res) => {
  const { hotmart_id, name, niche, url_sales_page } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (hotmart_id, name, niche, url_sales_page) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [hotmart_id, name, niche, url_sales_page]
    );
    // Init score
    await pool.query(
      `INSERT INTO product_scores (product_id) VALUES ($1)`,
      [result.rows[0].id]
    );
    res.status(201).json({ id: result.rows[0].id, msg: 'Product tracked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Dashboard Stats
app.get('/api/stats', async (req, res) => {
    try {
        const productsCount = await pool.query('SELECT COUNT(*) FROM products');
        const recentSales = await pool.query('SELECT SUM(sales_count) FROM daily_metrics'); // Mock aggregate
        
        // Count active agents dynamically
        const activeAgents = [
            detectorAgent.browser, 
            instagramAgent.browser, 
            learningAgent.browser,
            true, // Content (Service)
            true, // Git (Service)
            true  // Manager (Service)
        ].filter(Boolean).length;

        res.json({
            products: parseInt(productsCount.rows[0].count),
            sales: parseInt(recentSales.rows[0].sum || 0) * 25, // Mock revenue calc ($25 avg commission)
            content_generated: 843, // Placeholder until DB table exists
            active_agents: activeAgents,
            system_active: SYSTEM_ACTIVE
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update metrics & Recalculate Score
app.post('/api/metrics', async (req, res) => {
  const { product_id, sales, clicks, social_engagement, refund_count } = req.body;
  try {
    // 1. Save Metrics
    await pool.query(
      `INSERT INTO daily_metrics (product_id, sales_count, click_out_count, social_views, refund_count)
       VALUES ($1, $2, $3, $4, $5)`,
      [product_id, sales, clicks, social_engagement, refund_count]
    );

    // 2. Get current score params
    const scoreRes = await pool.query('SELECT * FROM product_scores WHERE product_id = $1', [product_id]);
    const scoreData = scoreRes.rows[0];

    // 3. Bayesian Update (Simplified)
    // In a real scenario, we update alpha/beta based on new evidence
    // For now, we just recalculate the instantaneous score for decision
    const newScore = bayesianEngine.calculateScore(sales + (clicks * 0.1), 100); // 100 as arbitrary trial base for now

    // 4. Update Score in DB
    await pool.query(
      `UPDATE product_scores SET mean_prob = $1, last_calculated_at = NOW() WHERE product_id = $2`,
      [newScore, product_id]
    );

    // 5. Decide Status
    const metricsObj = { sales, clicks, socialEngagement: social_engagement, refundCount: refund_count };
    const newStatus = bayesianEngine.decideStatus(metricsObj, 5); // 5 days arbitrary for test

    await pool.query('UPDATE products SET status = $1 WHERE id = $2', [newStatus, product_id]);

    res.json({ product_id, newScore, newStatus });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import detectorAgent from './src/agents/DetectorAgent.js';
import instagramAgent from './src/agents/InstagramAgent.js';
import contentAgent from './src/agents/ContentAgent.js';
import assetsAgent from './src/agents/AssetsAgent.js';
import gitAgent from './src/agents/GitAgent.js';
import learningAgent from './src/agents/LearningAgent.js';

// Init Agents
(async () => {
    try {
        await gitAgent.init();
        await learningAgent.init(); // Re-enabled after fix
        console.log('✅ Agents Initialized');
    } catch (e) {
        console.error('⚠️ Agent Init Warning:', e.message);
    }
})();

// ...

// Trigger Content Generation
app.post('/api/agents/content/generate', async (req, res) => {
    const { productName, niche } = req.body;
    try {
        // Run sequentially to save resources
        console.log('📝 Content Agent: Starting Text Gen...');
        const copy = await contentAgent.generateMarketingPost(productName, niche);
        
        console.log('🎨 Content Agent: Starting Prompt Gen...');
        const prompt = await contentAgent.generateImagePrompt(productName, niche);
        
        // Save to DB logic would go here
        
        res.json({ status: 'generated', copy, image_prompt: prompt });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Trigger Asset Scraping
app.post('/api/agents/assets/scan', async (req, res) => {
    const { productUrl } = req.body;
    try {
        const assets = await assetsAgent.findAffiliateMaterials(productUrl);
        res.json({ status: 'scanned', assets });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Trigger Detector Inspect (Specific URL)
app.post('/api/agents/detector/inspect', async (req, res) => {
    const { url } = req.body;
    try {
        // Run in background (async)
        detectorAgent.inspectDetails(url).then(details => {
             console.log('Inspection Complete:', details);
        });
        res.json({ status: 'inspecting', msg: 'Analizando página interna del producto...' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Trigger Git Auto-Commit
app.post('/api/agents/git/commit', async (req, res) => {
    // ... (existing code)
    const { message, branchType, branchName } = req.body;
    try {
        if (branchType && branchName) {
            await gitAgent.createBranch(branchType, branchName);
        }
        const result = await gitAgent.autoCommit(message || 'Auto-save by Manager Agent');
        if (result.status === 'success') {
            await gitAgent.pushChanges();
        }
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Git Status (Current Branch)
app.get('/api/git/status', async (req, res) => {
    try {
        const status = await gitAgent.getStatus();
        res.json(status);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- SETTINGS & DATA API ---

// Start Specific Agent
app.post('/api/agents/:name/start', async (req, res) => {
    const { name } = req.params;
    try {
        const result = await managerAgent.wakeAgent(name);
        if (result) {
            res.json({ status: 'success', msg: `Agent ${name} wake signal sent.` });
        } else {
            res.status(400).json({ status: 'failed', error: 'Agent could not be woken or does not support auto-wake.' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Mock Menu Settings
app.get('/api/settings/menu', (req, res) => {
    res.json({
        menu: [
            { id: 'dashboard', label: 'Dashboard', path: '/', default: true },
            { id: 'products', label: 'Products', path: '/products' },
            { id: 'agents', label: 'Agents', path: '/agents' }
        ]
    });
});

// Data Ingestion Endpoint
app.post('/api/agents/:agent/data', (req, res) => {
    const { agent } = req.params;
    const { type, filename } = req.body;
    console.log(`📂 Data received for ${agent}: ${filename} (${type})`);
    res.json({ status: 'success', msg: 'File queued for processing' });
});

import managerAgent from './src/agents/ManagerAgent.js';

// ...

// Trigger Manager Task
app.post('/api/agents/manager/task', async (req, res) => {
    const { type, payload } = req.body;
    try {
        const result = await managerAgent.assignTask(type, payload);
        res.json({ status: 'manager_ack', result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Trigger Learning Research
app.post('/api/agents/learning/research', async (req, res) => {
    const { topic, sourceUrl } = req.body;
    try {
        let results = [];
        if (topic) {
             results = await learningAgent.learnFromAcademy(topic);
        } else if (sourceUrl) {
             results = await learningAgent.digestNotebook(sourceUrl);
        }

        // Save event to DB
        await pool.query(
            `INSERT INTO agent_events (agent_name, event_type, payload) VALUES ($1, $2, $3)`,
            ['learning', 'research_completed', JSON.stringify({ topic: topic || 'Notebook', count: results.length, top_results: results.slice(0, 3) })]
        );

        res.json({ status: 'learned', results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET Learning Logs
app.get('/api/agents/learning/logs', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM agent_events WHERE agent_name = 'learning' ORDER BY created_at DESC LIMIT 10`
        );
        
        // Calculate "Mastery" based on total articles found
        const countRes = await pool.query(
            `SELECT SUM((payload->>'count')::int) as total_articles FROM agent_events WHERE agent_name = 'learning'`
        );
        const totalArticles = parseInt(countRes.rows[0].total_articles || 0);
        const masteryLevel = Math.min(100, Math.floor(totalArticles / 50 * 100)); // 50 articles = 100%

        res.json({ logs: result.rows, mastery: masteryLevel, total_topics: result.rowCount });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ... (existing routes)

// Trigger Instagram Login/Scan
app.post('/api/agents/instagram/start', async (req, res) => {
    try {
        // Run in background
        instagramAgent.login().then(result => {
             console.log('Instagram Task Complete:', result);
        });
        res.json({ status: 'started', msg: 'Instagram Agent iniciando sesión...' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ...

// Trigger Detector Agent
app.post('/api/agents/detector/start', async (req, res) => {
  try {
    // Run in background (dont await the full scan for the response)
    detectorAgent.scanMarket().then(result => {
      console.log('Scan complete:', result);
    }).catch(err => {
      console.error('Scan error:', err);
    });

    res.json({ status: 'Detector Agent Started', msg: 'The agent is browsing Hotmart in the background...' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', async (req, res) => {
// ...
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      db: 'Connected', 
      timestamp: dbRes.rows[0].now,
      redis: redisClient.isOpen ? 'Connected' : 'Disconnected' 
    });
  } catch (error) {
    res.status(500).json({ status: 'Error', error: error.message });
  }
});

// --- AGENT MANAGEMENT & CONTROL ---

// Stop specific agent
app.post('/api/agents/:name/stop', async (req, res) => {
    const { name } = req.params;
    try {
        let result = { status: 'unknown' };
        switch(name) {
            case 'detector': result = await detectorAgent.stop(); break;
            case 'instagram': result = await instagramAgent.stop(); break;
            case 'learning': result = await learningAgent.stop(); break;
            default: return res.status(404).json({ error: 'Agent not found or does not support stop' });
        }
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// List all internal agents and their status
app.get('/api/agents', async (req, res) => {
    res.json({
        agents: [
            { id: 'detector', name: 'Detector Agent', type: 'Scraper', status: detectorAgent.browser ? 'Running' : 'Stopped' },
            { id: 'instagram', name: 'Instagram Agent', type: 'Social', status: instagramAgent.browser ? 'Running' : 'Stopped' },
            { id: 'content', name: 'Content Agent', type: 'LLM', status: 'Active (Service)' },
            { id: 'assets', name: 'Assets Agent', type: 'Scraper', status: 'Idle' },
            { id: 'git', name: 'Git Agent', type: 'Utility', status: 'Active' },
            { id: 'learning', name: 'Learning Agent', type: 'Scraper', status: learningAgent.browser ? 'Running' : 'Stopped' },
            { id: 'manager', name: 'Manager Agent', type: 'Orchestrator', status: 'Active' }
        ]
    });
});

// Scaffold new agent
app.post('/api/agents/create', async (req, res) => {
    const { agentName, description } = req.body;
    
    // Sanitize
    const safeName = agentName.replace(/[^a-zA-Z0-9]/g, '');
    const className = safeName.charAt(0).toUpperCase() + safeName.slice(1) + 'Agent';
    const fileName = `${className}.js`;
    const filePath = path.join(__dirname, 'src', 'agents', fileName);

    const template = `class ${className} {
    constructor() {
        console.log('🤖 ${className}: Initialized - ${description}');
    }

    async doTask() {
        console.log('Work in progress...');
        return { status: 'done' };
    }
}

export default new ${className}();
`;

    try {
        if (fs.existsSync(filePath)) {
            return res.status(400).json({ error: 'Agent already exists' });
        }
        fs.writeFileSync(filePath, template);
        res.json({ status: 'created', path: filePath, msg: 'Please restart container to load new agent' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Schedule Daily Routine: Runs at 02:00 AM every day
cron.schedule('0 2 * * *', () => {
    console.log('🕐 Cron Job: Triggering Daily Routine...');
    managerAgent.runDailyRoutine();
});

// Manual Trigger for Daily Routine
app.post('/api/agents/manager/daily', async (req, res) => {
    try {
        const result = await managerAgent.runDailyRoutine();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
