import puppeteer from 'puppeteer-core';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

class InstagramAgent {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'https://www.instagram.com';
        this.isLoggedIn = false;
        this.cookiesPath = path.join(process.cwd(), 'instagram_cookies.json');
        this.maxRetries = 3;
        this.retryDelay = 2000;
    }

    async init() {
        if (!this.browser) {
            console.log('📸 Instagram Agent: Launching Browser...');
            const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                                   '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            
            this.browser = await puppeteer.launch({
                executablePath: fs.existsSync(executablePath) ? executablePath : undefined,
                headless: "new", 
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1280,800'
                ]
            });
            this.page = await this.browser.newPage();
            // Set User Agent to avoid immediate detection
            await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
            await this.page.setViewport({ width: 1280, height: 800 });
            
            // Pass webdriver check
            await this.page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });
            });
        }
    }

    async login() {
        return await this.retryOperation(async () => {
            try {
                await this.init();
                console.log('📸 Instagram Agent: Navigating to login...');
                
                // Load existing cookies first
                const cookiesLoaded = await this.loadCookies();
                
                // Go to home first
                await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
                await new Promise(r => setTimeout(r, 2000));
                
                // Handle "Allow Cookies" if present
                try {
                    const buttons = await this.page.$$('button');
                    for (const btn of buttons) {
                        const text = await this.page.evaluate(el => el.textContent, btn);
                        if (text.includes('Allow all') || text.includes('Decline optional') || text.includes('Aceptar todas')) {
                            console.log('📸 Clicking cookie banner:', text);
                            await btn.click();
                            await new Promise(r => setTimeout(r, 1000));
                            break;
                        }
                    }
                } catch (e) {}

                // Check if already logged in (cookies worked)
                const loggedIn = await this.page.$('svg[aria-label="Home"]');
                if (loggedIn && cookiesLoaded) {
                    console.log('📸 Instagram Agent: Already logged in via cookies!');
                    this.isLoggedIn = true;
                    return { status: 'success', message: 'Already logged in' };
                }

                // Navigate to login if not there
                if (!this.page.url().includes('login')) {
                     await this.page.goto(this.baseUrl + '/accounts/login/', { waitUntil: 'networkidle2' });
                }

                // Validate credentials
                if (!process.env.INSTAGRAM_USER || !process.env.INSTAGRAM_PASSWORD) {
                    throw new Error('Instagram credentials not configured in environment variables');
                }

                console.log('📸 Instagram Agent: Typing credentials...');
                
                // Wait for inputs with extended timeout
                try {
                    await this.page.waitForSelector('input[name="username"]', { visible: true, timeout: 15000 });
                } catch (e) {
                    console.log('📸 Debug: Login form not found. Current URL:', this.page.url());
                    throw new Error('Login form not found (Bot detection?)');
                }
                
                await this.page.type('input[name="username"]', process.env.INSTAGRAM_USER, { delay: 150 });
                await this.page.type('input[name="password"]', process.env.INSTAGRAM_PASSWORD, { delay: 150 });

                // Click Login
                const loginBtn = await this.page.$('button[type="submit"]');
                if (loginBtn) {
                    await Promise.all([
                        this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
                        loginBtn.click()
                    ]);
                }

                // Handle potential challenges
                await new Promise(r => setTimeout(r, 3000));

                // Check for success
                const homeIcon = await this.page.$('svg[aria-label="Home"]');
                
                if (homeIcon) {
                    console.log('📸 Instagram Agent: Login Success!');
                    this.isLoggedIn = true;
                    await this.saveCookies();
                    return { status: 'success', message: 'Login Successful' };
                } else {
                    // Check for challenge page
                    const currentUrl = this.page.url();
                    if (currentUrl.includes('challenge') || currentUrl.includes('two_factor')) {
                        throw new Error('Challenge/2FA required - manual intervention needed');
                    }
                    
                    console.log('📸 Instagram Agent: Login Failed. Current URL:', currentUrl);
                    throw new Error('Could not verify login - credentials may be invalid');
                }

            } catch (error) {
                console.error('📸 Instagram Agent Error:', error);
                this.isLoggedIn = false;
                throw error;
            }
        });
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

    async publishContent(content, mediaPath = null) {
        console.log('📸 Instagram Agent: Publishing content...');
        
        try {
            if (!this.isLoggedIn) {
                const loginResult = await this.login();
                if (loginResult.status !== 'success') {
                    return { status: 'failed', message: 'Login required for publishing' };
                }
            }

            await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 2000));

            // Click on create post button
            const createBtn = await this.page.waitForSelector('svg[aria-label="New post"]', { timeout: 10000 });
            await createBtn.click();
            await new Promise(r => setTimeout(r, 2000));

            if (mediaPath) {
                // Handle media upload
                const fileInput = await this.page.$('input[type="file"]');
                if (fileInput) {
                    await fileInput.uploadFile(mediaPath);
                    await this.page.waitForSelector('button[aria-label="Next"]', { timeout: 15000 });
                    await this.page.click('button[aria-label="Next"]');
                    await new Promise(r => setTimeout(r, 1000));
                    await this.page.click('button[aria-label="Next"]');
                    await new Promise(r => setTimeout(r, 1000));
                }
            } else {
                // Handle text-only post
                await this.page.waitForSelector('div[role="button"]', { timeout: 10000 });
                await this.page.click('div[role="button"]');
                await new Promise(r => setTimeout(r, 1000));
            }

            // Add caption
            const captionInput = await this.page.waitForSelector('textarea[aria-label="Write a caption..."]', { timeout: 10000 });
            await captionInput.type(content, { delay: 50 });

            // Share post
            await this.page.waitForSelector('div[role="button"] > div > div > div > div', { timeout: 10000 });
            const shareButtons = await this.page.$$('div[role="button"]');
            for (const btn of shareButtons) {
                const text = await this.page.evaluate(el => el.textContent, btn);
                if (text.includes('Share') || text.includes('Publicar')) {
                    await btn.click();
                    break;
                }
            }

            await new Promise(r => setTimeout(r, 3000));

            console.log('✅ Instagram Agent: Content published successfully!');
            return { status: 'success', message: 'Content published successfully' };

        } catch (error) {
            console.error('❌ Instagram Agent: Publishing failed:', error.message);
            return { status: 'failed', message: error.message };
        }
    }

    async publishStory(content, mediaPath = null) {
        console.log('📸 Instagram Agent: Publishing story...');
        
        try {
            if (!this.isLoggedIn) {
                const loginResult = await this.login();
                if (loginResult.status !== 'success') {
                    return { status: 'failed', message: 'Login required for story publishing' };
                }
            }

            await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 2000));

            // Click on story creation
            const storyBtn = await this.page.waitForSelector('svg[aria-label="Your story"]', { timeout: 10000 });
            await storyBtn.click();
            await new Promise(r => setTimeout(r, 2000));

            if (mediaPath) {
                // Upload media to story
                const fileInput = await this.page.$('input[type="file"]');
                if (fileInput) {
                    await fileInput.uploadFile(mediaPath);
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            // Add text to story if no media
            if (!mediaPath) {
                await this.page.waitForSelector('div[role="button"]', { timeout: 10000 });
                await this.page.click('div[role="button"]');
                await new Promise(r => setTimeout(r, 1000));
                
                const textInput = await this.page.waitForSelector('input[placeholder="Type something..."]', { timeout: 10000 });
                await textInput.type(content, { delay: 50 });
            }

            // Share story
            const shareButtons = await this.page.$$('button');
            for (const btn of shareButtons) {
                const text = await this.page.evaluate(el => el.textContent, btn);
                if (text.includes('Share') || text.includes('Publicar') || text.includes('Your story')) {
                    await btn.click();
                    break;
                }
            }

            await new Promise(r => setTimeout(r, 3000));

            console.log('✅ Instagram Agent: Story published successfully!');
            return { status: 'success', message: 'Story published successfully' };

        } catch (error) {
            console.error('❌ Instagram Agent: Story publishing failed:', error.message);
            return { status: 'failed', message: error.message };
        }
    }

    async saveCookies() {
        try {
            const cookies = await this.page.cookies();
            fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
            console.log('📸 Instagram Agent: Cookies saved');
        } catch (error) {
            console.error('❌ Failed to save cookies:', error.message);
        }
    }

    async loadCookies() {
        try {
            if (fs.existsSync(this.cookiesPath)) {
                const cookies = JSON.parse(fs.readFileSync(this.cookiesPath, 'utf8'));
                await this.page.setCookie(...cookies);
                console.log('📸 Instagram Agent: Cookies loaded');
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to load cookies:', error.message);
        }
        return false;
    }

    async retryOperation(operation, maxRetries = this.maxRetries) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await operation();
                return result;
            } catch (error) {
                console.log(`📸 Retry ${i + 1}/${maxRetries}: ${error.message}`);
                if (i === maxRetries - 1) throw error;
                await new Promise(r => setTimeout(r, this.retryDelay * (i + 1)));
            }
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
        this.isLoggedIn = false;
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
