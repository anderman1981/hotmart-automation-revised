import { launch } from 'puppeteer-core';

/**
 * BrowserSessionManager - Detecta y usa sesiones activas de Hotmart
 * 
 * Permite al sistema trabajar con la sesión del navegador del usuario
 * si está logueado en Hotmart, evitando login innecesarios.
 */
class BrowserSessionManager {
    constructor() {
        this.browser = null;
        this.sessionValid = false;
        this.lastCheck = null;
        this.cookies = null;
    }

    /**
     * Detecta si el navegador tiene una sesión activa de Hotmart
     * @param {string} hotmartEmail - Email del usuario en Hotmart
     * @returns {Promise<{valid: boolean, reason: string}>}
     */
    async detectBrowserSession(hotmartEmail) {
        console.log('🔍 Detectando sesión de navegador en Hotmart...');
        
        try {
            // Lanzar navegador en modo headless para verificar sesión
            this.browser = await launch({
                headless: 'new',
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled'
                ]
            });

            const page = await this.browser.newPage();
            
            // Configurar viewport y user agent realista
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Intentar acceder a la página de productos (requiere autenticación)
            console.log('🌐 Navegando a Hotmart Marketplace...');
            await page.goto('https://hotmart.com/marketplace', { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            // Esperar a que cargue
            await page.waitForTimeout(3000);

            // Verificar si estamos logueados
            const currentUrl = page.url();
            const pageTitle = await page.title();
            
            console.log(`📍 URL actual: ${currentUrl}`);
            console.log(`📄 Título: ${pageTitle}`);

            // Verificar si redirigió a login
            const isLoginPage = currentUrl.includes('login') || 
                               currentUrl.includes('auth') ||
                               pageTitle.toLowerCase().includes('login') ||
                               pageTitle.toLowerCase().includes('iniciar sesión');

            if (isLoginPage) {
                console.log('❌ Sesión no encontrada - redirigido a login');
                this.sessionValid = false;
                await page.close();
                await this.browser.close();
                return { 
                    valid: false, 
                    reason: 'Sesión no encontrada - se requiere login manual',
                    redirectUrl: currentUrl
                };
            }

            // Verificar si hay contenido de marketplace (indica sesión activa)
            const hasContent = await page.evaluate(() => {
                const products = document.querySelectorAll('[data-testid="product-card"], .product-card, .course-card');
                return products.length > 0;
            });

            // Guardar cookies para uso futuro
            this.cookies = await page.cookies();
            
            console.log('✅ Sesión de navegador detectada correctamente');
            this.sessionValid = true;
            this.lastCheck = new Date().toISOString();
            
            await page.close();
            await this.browser.close();

            return {
                valid: true,
                reason: 'Sesión activa detectada en navegador',
                hasProducts: hasContent,
                cookiesCount: this.cookies.length,
                lastCheck: this.lastCheck
            };

        } catch (error) {
            console.error('❌ Error detectando sesión:', error.message);
            this.sessionValid = false;
            
            if (this.browser) {
                try {
                    await this.browser.close();
                } catch (e) {
                    // Ignore close errors
                }
            }

            return {
                valid: false,
                reason: `Error: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * Usa cookies guardadas para hacer requests autenticados
     * @param {string} url - URL a visitar
     * @returns {Promise<Object>}
     */
    async fetchWithSession(url) {
        if (!this.cookies || this.cookies.length === 0) {
            throw new Error('No hay cookies de sesión disponibles');
        }

        try {
            this.browser = await launch({
                headless: 'new',
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await this.browser.newPage();
            
            // Inyectar cookies guardadas
            await page.setCookie(...this.cookies);
            
            // Navegar a la URL con sesión
            await page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            // Obtener contenido
            const content = await page.content();
            const title = await page.title();
            
            await page.close();
            await this.browser.close();

            return {
                success: true,
                content,
                title,
                url: page.url()
            };

        } catch (error) {
            if (this.browser) {
                try {
                    await this.browser.close();
                } catch (e) {}
            }
            throw error;
        }
    }

    /**
     * Verifica si la sesión sigue siendo válida
     */
    isSessionValid() {
        return this.sessionValid && this.cookies && this.cookies.length > 0;
    }

    /**
     * Obtiene el estado de la sesión
     */
    getSessionStatus() {
        return {
            valid: this.sessionValid,
            hasCookies: this.cookies ? this.cookies.length > 0 : false,
            cookiesCount: this.cookies ? this.cookies.length : 0,
            lastCheck: this.lastCheck
        };
    }
}

export default new BrowserSessionManager();
