import puppeteer from 'puppeteer-core';
import fs from 'fs';

class AssetsAgent {
    constructor() {
        this.browser = null;
    }

    async findAffiliateMaterials(productUrl) {
        let browser;
        try {
            console.log(`🎨 Assets Agent: Scouting visuals for ${productUrl}...`);
            const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                                   '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            
            browser = await puppeteer.launch({
                executablePath: fs.existsSync(executablePath) ? executablePath : undefined,
                args: ['--no-sandbox', '--disable-gpu'],
                headless: 'new'
            });
            const page = await browser.newPage();
            // Stealthier User Agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 45000 });

            // 1. Extract Images (Hero, etc)
            const images = await page.evaluate(() => {
                const imgs = Array.from(document.querySelectorAll('img'));
                return imgs
                    .filter(img => img.width > 250 && img.height > 250) // Use robust threshold
                    .map(img => img.src)
                    .slice(0, 8); // Top 8
            });

            // 2. Extract Drive/Dropbox/Mega Links (Enhanced)
            const driveLinks = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a'));
                const keywords = ['material', 'drive', 'dropbox', 'afiliado', 'affiliate', 'recursos', 'creativos', 'pack'];
                
                return anchors
                    .filter(a => {
                        const txt = a.innerText.toLowerCase();
                        const href = a.href.toLowerCase();
                        // Check if href is a cloud drive
                        const isCloud = href.includes('drive.google.com') || href.includes('dropbox.com') || href.includes('mega.nz');
                        // Check if text indicates affiliate material
                        const isMaterial = keywords.some(k => txt.includes(k));
                        
                        return isCloud || (isMaterial && href.startsWith('http'));
                    })
                    .map(a => ({
                        text: a.innerText.trim() || 'Link',
                        url: a.href,
                        type: a.href.includes('drive.google') ? 'Google Drive' : 
                              a.href.includes('dropbox') ? 'Dropbox' : 
                              a.href.includes('mega.nz') ? 'Mega' : 'External Resource'
                    }));
            });

            await browser.close();

            console.log(`🎨 Assets Agent: Found ${images.length} images and ${driveLinks.length} material links.`);

            return {
                images_found: images,
                material_links: driveLinks
            };

        } catch (error) {
            console.error('❌ Assets Extraction Failed:', error);
            if (browser) await browser.close();
            return { images_found: [], material_links: [], error: error.message };
        }
    }
}

export default new AssetsAgent();
