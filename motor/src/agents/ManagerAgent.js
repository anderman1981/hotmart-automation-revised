import axios from 'axios';
import gitAgent from './GitAgent.js';
import contentAgent from './ContentAgent.js';

class ManagerAgent {
    constructor() {
        this.tasks = []; // Queue
        // Configured Project Port: 4125
        this.n8nWebhook = process.env.N8N_WEBHOOK_URL || 'http://localhost:4125/webhook/manager-event';
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

    async runDailyRoutine() {
        console.log('🌅 Starting Daily Automation Routine...');
        const report = { date: new Date(), steps: [] };

        try {
            // Step 1: Market Scan
            // Lazy load to avoid circular dep if any (ESM Dynamic Import)
            const { default: detectorAgent } = await import('./DetectorAgent.js');
            console.log('Step 1: Scanning Market...');
            const scanResult = await detectorAgent.scanMarket();
            report.steps.push({ name: 'Market Scan', status: 'completed', details: scanResult });

            // Step 2: Learning
            // Lazy load Learning Agent
             const { default: learningAgent } = await import('./LearningAgent.js');
            console.log('Step 2: Learning from Academy...');
            const learnedCourses = await learningAgent.learnSpecificCourses();
            report.steps.push({ name: 'Academy Learning', status: 'completed', details: learnedCourses });

            // Step 3: Strategy Generation for Top Products (Mocking top products for now)
            // In a real scenario, we'd query the DB for products with status 'active' or 'testing'
            const productsToStrategize = [
                { name: 'Excel para Negocios', niche: 'Business' },
                { name: 'Curso de Manicure Ruso', niche: 'Beauty' }
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
