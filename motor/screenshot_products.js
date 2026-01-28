import puppeteer from 'puppeteer';
import 'dotenv/config';

const screenshotProducts = async () => {
    console.log('📸 Iniciando captura de pantalla de la sección de productos...');
    
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Configurar viewport
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Navegar al dashboard
        await page.goto('http://localhost:4124', { waitUntil: 'networkidle2' });
        
        // Esperar a que cargue el dashboard
        await page.waitForTimeout(3000);
        
        // Navegar a la sección de productos
        await page.click('[href="/products"], button:contains("Productos"), a:contains("Productos")');
        await page.waitForTimeout(2000);
        
        // Si no encuentra el enlace, navegar directamente
        if (await page.$('[href="/products"]') === null) {
            await page.goto('http://localhost:4124/products', { waitUntil: 'networkidle2' });
            await page.waitForTimeout(3000);
        }
        
        // Esperar a que carguen los productos
        await page.waitForSelector('.grid', { timeout: 10000 });
        await page.waitForTimeout(2000);
        
        // Tomar screenshot de alta calidad
        await page.screenshot({ 
            path: 'products-section-enhanced.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1920, height: 1080 },
            quality: 100
        });
        
        console.log('✅ Screenshot guardado como "products-section-enhanced.png"');
        
        // Tomar un segundo mostrando el filtro de freezer
        const freezerButton = await page.$('button:contains("Freezer"), button:has(.snowflake)');
        if (freezerButton) {
            await freezerButton.click();
            await page.waitForTimeout(1000);
            
            await page.screenshot({ 
                path: 'products-section-freezer.png',
                fullPage: false,
                clip: { x: 0, y: 0, width: 1920, height: 1080 },
                quality: 100
            });
            
            console.log('✅ Screenshot del freezer guardado como "products-section-freezer.png"');
        }
        
        // Generar una vista con productos seleccionados
        const firstProduct = await page.$('.grid > div:first-child');
        if (firstProduct) {
            await page.click('.grid > div:first-child button:has(.square)');
            await page.waitForTimeout(500);
            
            await page.screenshot({ 
                path: 'products-section-selected.png',
                fullPage: false,
                clip: { x: 0, y: 0, width: 1920, height: 1080 },
                quality: 100
            });
            
            console.log('✅ Screenshot con selección guardado como "products-section-selected.png"');
        }
        
    } catch (error) {
        console.error('❌ Error al tomar screenshot:', error);
    } finally {
        await browser.close();
    }
};

screenshotProducts();