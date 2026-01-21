import puppeteer from 'puppeteer-core';
import 'dotenv/config';
import fs from 'fs';

class InstagramAgent {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'https://www.instagram.com';
    }

    async init() {
        if (!this.browser) {
            console.log('📸 Instagram Agent: Launching Browser...');
            const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                                   '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            
            this.browser = await puppeteer.launch({
                executablePath: fs.existsSync(executablePath) ? executablePath : undefined,
                headless: "new", // Headless for Docker
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            });
            this.page = await this.browser.newPage();
            // Set User Agent to avoid immediate detection
            await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await this.page.setViewport({ width: 1280, height: 800 });
        }
    }

    async login() {
        try {
            await this.init();
            console.log('📸 Instagram Agent: Navigating to login...');
            await this.page.goto(this.baseUrl + '/accounts/login/', { waitUntil: 'networkidle2' });

            // Check if already logged in (cookies)
            const loggedIn = await this.page.$('svg[aria-label="Home"]');
            if (loggedIn) {
                console.log('📸 Instagram Agent: Already logged in!');
                return { status: 'success', message: 'Already logged in' };
            }

            // Accept cookies/dialogs if any (European servers etc)
            try {
                const acceptCookies = await this.page.$x("//button[contains(text(), 'Allow all')]");
                if (acceptCookies.length > 0) await acceptCookies[0].click();
            } catch (e) {}

            console.log('📸 Instagram Agent: Typing credentials...');
            
            // Wait for inputs
            await this.page.waitForSelector('input[name="username"]', { visible: true, timeout: 10000 });
            
            await this.page.type('input[name="username"]', process.env.INSTAGRAM_USER || '', { delay: 100 });
            await this.page.type('input[name="password"]', process.env.INSTAGRAM_PASSWORD || '', { delay: 100 });

            // Click Login
            const loginBtn = await this.page.$('button[type="submit"]');
            if (loginBtn) {
                await Promise.all([
                    this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
                    loginBtn.click()
                ]);
            }

            // Check for success
            const homeIcon = await this.page.waitForSelector('svg[aria-label="Home"]', { timeout: 15000 }).catch(() => null);
            
            if (homeIcon) {
                console.log('📸 Instagram Agent: Login Success!');
                // Here we would save cookies to avoid relogin
                return { status: 'success', message: 'Login Successful' };
            } else {
                console.log('📸 Instagram Agent: Login Failed or Challenge Required.');
                // Take screenshot for debug
                // await this.page.screenshot({ path: 'instagram_debug.png' });
                return { status: 'failed', message: 'Could not verify login (Challenge/2FA maybe?)' };
            }

        } catch (error) {
            console.error('📸 Instagram Agent Error:', error);
            if (this.browser) await this.browser.close();
            this.browser = null;
            return { status: 'error', message: error.message };
        }
    }

    async getProfileStats(username) {
        try {
             if (!this.browser) await this.init();
             const target = username || process.env.INSTAGRAM_USER;
             await this.page.goto(`${this.baseUrl}/${target}/`, { waitUntil: 'networkidle2' });
             
             // Extract basic stats
             const stats = await this.page.evaluate(() => {
                 const headers = Array.from(document.querySelectorAll('header section ul li'));
                 if (headers.length < 3) return null;
                 return {
                     posts: headers[0].innerText,
                     followers: headers[1].innerText,
                     following: headers[2].innerText
                 };
             });

             console.log('📸 Stats retrieved:', stats);
             return stats;

        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
    async stop() {
        console.log('🛑 Instagram Agent: Stopping...');
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
        this.page = null;
        console.log('🛑 Instagram Agent: Stopped.');
        return { status: 'stopped' };
    }
}

export default new InstagramAgent();
