import { launch } from 'puppeteer-core';
import { Pool } from 'pg';

const DetectorAgent = {
    name: 'DetectorAgent',
    initialize: async function() {
        console.log('DetectorAgent initialized');
        return true;
    },
    
    checkUrl: async function(url) {
        try {
            const browser = await launch({ 
                headless: 'new'
            });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            const title = await page.title();
            await browser.close();
            return { success: true, title };
        } catch (error) {
            console.error('DetectorAgent error:', error);
            return { success: false, error: error.message };
        }
    }
};

export default DetectorAgent;
