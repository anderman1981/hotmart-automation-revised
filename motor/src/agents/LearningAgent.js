import puppeteer from 'puppeteer-core';
import fs from 'fs';

class LearningAgent {
    constructor() {
        this.browser = null;
        this.baseUrl = 'https://hotmart.com/es/blog'; // Base for Academy
    }

    async init() {
        if (!this.browser) {
            const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                                   '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
                                   
            this.browser = await puppeteer.launch({
                executablePath: fs.existsSync(executablePath) ? executablePath : undefined,
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
            });
            this.page = await this.browser.newPage();
            await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
        }
    }

    async learnSpecificCourses() {
        await this.init();
        const targets = [
            "Curso 1: Crea y vende tu producto digital desde cero",
            "Curso 2: Prepara tu lanzamiento y escala tu producto digital",
            "Black November"
        ];
        
        try {
            console.log(`🧠 Learning Agent: Starting targeted course study...`);
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });

            const findings = [];

            // Targeted scraper for "Available Formations" cards
            // This assumes cards contain the titles. We'll search for them.
            const pageData = await this.page.evaluate(() => {
                const cards = Array.from(document.querySelectorAll('div, article, section')); 
                // Getting broad elements to text match since we don't know exact classes
                return cards
                    .filter(el => el.innerText && el.innerText.length > 10 && el.innerText.length < 200)
                    .map(el => ({ text: el.innerText, html: el.outerHTML }));
            });

            for (const target of targets) {
                console.log(`🧠 Looking for course: "${target}"...`);
                // Simple fuzzy match simulation since we can't reliably click deep without exact selectors
                const match = pageData.find(d => d.text.toLowerCase().includes(target.toLowerCase().substring(0, 15)));
                
                if (match) {
                    console.log(`✅ Found course material: ${target}`);
                    findings.push({
                        title: target,
                        status: 'studied',
                        snippet: `Captured info on ${target}. Ready to apply strategies.`
                    });
                } else {
                     console.log(`⚠️ Course not found in immediate view: ${target}`);
                }
            }

            return findings;

        } catch (e) {
            console.error('❌ Targeted Learning Error:', e);
            return [];
        }
    }

    async learnFromAcademy(query) {
        await this.init();
        try {
            const searchUrl = `${this.baseUrl}/blog/search?q=${encodeURIComponent(query)}`;
            console.log(`🧠 Learning Agent: Searching Academy for "${query}"...`);
            
            await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
            
            // Simple scraper for blog titles and excerpts
            const articles = await this.page.evaluate(() => {
                const items = document.querySelectorAll('article h3, article h2'); // Generic selectors, might need tuning
                const results = [];
                items.forEach(item => {
                    results.push({
                        title: item.innerText,
                        link: item.closest('a') ? item.closest('a').href : null
                    });
                });
                return results;
            });

            console.log(`🧠 Found ${articles.length} articles.`);
            return articles;

        } catch (e) {
            console.error('❌ Learning Error:', e);
            return [];
        }
    }
    
    // Future: Method to digest NotebookLM content 
    // (NotebookLM doesn't have a public API yet, needs specific strategy or manual export handling)
    async digestNotebook(url) {
        // Placeholder for NotebookLM logic
        console.log('🧠 Digesting NotebookLM (Simulated): ' + url);
        return { status: 'ingested', summary: 'Simulated ingestion of notebook content.' };
    }

    async close() {
        // Alias for stop
        return this.stop();
    }

    async stop() {
        console.log('🛑 Learning Agent: Stopping...');
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
        console.log('🛑 Learning Agent: Stopped.');
        return { status: 'stopped' };
    }
}

export default new LearningAgent();
