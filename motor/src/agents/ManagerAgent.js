import axios from 'axios';
import gitAgent from './GitAgent.js';
import contentAgent from './ContentAgent.js';

import pg from 'pg';
const { Pool } = pg;

class ManagerAgent {
    constructor() {
        this.tasks = []; // Queue
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: 5432,
        });
        // Configured Project Port: 4125
        this.n8nWebhook = process.env.N8N_WEBHOOK_URL || 'http://localhost:4125/webhook/manager-event';
    }

    async getStrategicKnowledge(query = '') {
        console.log(`👔 Manager Agent: Searching knowledge base for "${query}"...`);
        try {
            const result = await this.pool.query(
                "SELECT content FROM knowledge_base WHERE content ILIKE $1 OR source ILIKE $1 LIMIT 3",
                [`%${query}%`]
            );
            return result.rows.map(r => r.content).join('\n---\n');
        } catch (e) {
            console.error('❌ Strategy Query Failed:', e.message);
            return '';
        }
    }

    async assignTask(taskType, payload) {
        console.log(`👔 Manager Agent: Received task '${taskType}'`, payload);
        
        let result = { status: 'unknown' };
        
        // Orchestration Logic
        switch(taskType) {
            case 'content_strategy':
                // Ask content agent to plan, then log to N8N
                result = await contentAgent.generateMarketingPost(payload.product, payload.niche);
                this.notifyN8N('task_completed', { task: taskType, output: result });
                break;
            
            case 'git_ops':
                // Delegate to Git Agent
                result = await gitAgent.autoCommit(payload.message);
                if(result.status === 'success') await gitAgent.pushChanges();
                break;
                
            case 'daily_report':
                // Generate report
                result = { report: 'Daily summary generated (mock)' };
                this.notifyN8N('report_ready', result);
                break;

            case 'run_daily_routine':
                result = await this.runDailyRoutine();
                break;
        }

        return result;
    }

    async wakeAgent(agentName) {
        console.log(`⚡ Manager: Waking up ${agentName}...`);
        try {
            switch(agentName.toLowerCase()) {
                case 'detector':
                    const { default: detector } = await import('./DetectorAgent.js');
                    if (!detector.browser) await detector.init(); // Assume init logic exists
                    break;
                case 'learning':
                    const { default: learning } = await import('./LearningAgent.js');
                    if (!learning.browser) await learning.init();
                    break;
                case 'instagram':
                    const { default: insta } = await import('./InstagramAgent.js');
                    // Instagram might need login, not just init
                    await insta.login(); 
                    break;
                default:
                    console.log(`⚠️ Agent ${agentName} does not support explicit wake.`);
                    return false;
            }
            return true;
        } catch (e) {
            console.error(`❌ Failed to wake ${agentName}:`, e.message);
            return false;
        }
    }

    async runDailyRoutine() {
        console.log('🌅 Starting Daily Automation Routine...');
        const report = { date: new Date(), steps: [] };

        try {
            // Step 1: Market Scan
            console.log('Step 1: Waking Detector Agent for Market Scan...');
            await this.wakeAgent('detector');
            const { default: detectorAgent } = await import('./DetectorAgent.js');
            
            const scanResult = await detectorAgent.scanMarket();
            report.steps.push({ name: 'Market Scan', status: 'completed', details: scanResult });

            // Step 2: Learning
            console.log('Step 2: Waking Learning Agent...');
            await this.wakeAgent('learning');
            const { default: learningAgent } = await import('./LearningAgent.js');
            
            const learnedCourses = await learningAgent.learnSpecificCourses();
            report.steps.push({ name: 'Academy Learning', status: 'completed', details: learnedCourses });

            // Step 3: Strategy Generation for Top Products (Mocking top products for now)
            // In a real scenario, we'd query the DB for products with status 'active' or 'testing'
            const productsToStrategize = [
                { name: 'Excel for Business', niche: 'Business' },
                { name: 'Russian Manicure Course', niche: 'Beauty' }
            ];

            const strategies = [];
            for (const p of productsToStrategize) {
                console.log(`Step 3: Generating strategy for ${p.name}...`);
                const strat = await contentAgent.generateStrategy(p.name, p.niche);
                strategies.push({ product: p.name, strategy: strat });
            }
            report.steps.push({ name: 'Strategy Gen', status: 'completed', msg: `${strategies.length} strategies created`, custom_data: strategies });

            console.log('✅ Daily Routine Completed.');
            this.notifyN8N('daily_routine_completed', report);
            return { status: 'success', report };

        } catch (e) {
            console.error('❌ Daily Routine Failed:', e);
            report.error = e.message;
            return { status: 'failed', report };
        }
    }

    async notifyN8N(event, data) {
        try {
            console.log(`👔 Manager Agent: Sending event '${event}' to N8N...`);
            // Fire and forget (or await if critical)
            await axios.post(this.n8nWebhook, { event, task: event, output: data, timestamp: new Date() });
            console.log('✅ N8N Notified successfully');
        } catch (e) {
            console.error('❌ N8N Notification Failed:', e.message);
        }
    }
}

export default new ManagerAgent();
