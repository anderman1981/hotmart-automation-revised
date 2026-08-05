/**
 * HotmartURLGenerator - Genera URLs correctas de Hotmart
 * 
 * Formatos de URL correctos:
 * - Sales Page: https://pay.hotmart.com/{offer_code}
 * - Affiliate: https://pay.hotmart.com/{offer_code}?ref={affiliate_code}
 * 
 * NOTA: Los offer codes son códigos únicos como "02mhofjd", "n82b9jqz"
 * NO son los IDs de producto como "PROD17859435452250"
 * 
 * Para obtener offer codes reales se necesita la API de Hotmart:
 * - Client ID y Client Secret en .env
 * - Documentación: https://developers.hotmart.com/docs/
 */

import hotmartClient from './HotmartAPIClient.js';

const AFFILIATE_CODE = process.env.HOTMART_AFFILIATE_CODE || 'W949655431L';

// Cache de offer codes por product ucode
const offerCodeCache = new Map();

/**
 * Obtiene el offer code real de un producto usando la API de Hotmart
 * @param {string} productUcode - UUID del producto (ej: "839F1A4F-43DC-F60F-13FE-6C8BD23F6781")
 * @returns {Promise<string|null>} Offer code o null si no se puede obtener
 */
export async function getOfferCodeFromAPI(productUcode) {
    if (!productUcode) return null;
    
    // Verificar cache
    if (offerCodeCache.has(productUcode)) {
        return offerCodeCache.get(productUcode);
    }
    
    try {
        const offers = await hotmartClient.getProductOffers(productUcode);
        if (offers.items && offers.items.length > 0) {
            // Tomar la primera oferta (la principal)
            const mainOffer = offers.items.find(o => o.is_main_offer) || offers.items[0];
            const code = mainOffer.code;
            
            // Guardar en cache
            offerCodeCache.set(productUcode, code);
            
            console.log(`✅ Got offer code for ${productUcode}: ${code}`);
            return code;
        }
    } catch (error) {
        console.warn(`⚠️ Could not get offer code for ${productUcode}:`, error.message);
    }
    
    return null;
}

/**
 * Genera la URL de venta de un producto Hotmart
 * @param {string} productId - ID del producto o ucode
 * @param {string} offerCode - Offer code real (opcional, se obtiene de la API si no se proporciona)
 * @returns {string} URL de venta
 */
export async function generateSalesUrl(productId, offerCode = null) {
    // Si ya tenemos un offer code, usarlo directamente
    if (offerCode) {
        return `https://pay.hotmart.com/${offerCode}`;
    }
    
    // Intentar obtener de la API
    if (hotmartClient.hasCredentials()) {
        const code = await getOfferCodeFromAPI(productId);
        if (code) {
            return `https://pay.hotmart.com/${code}`;
        }
    }
    
    // Fallback: generar URL con formato conocido
    // NOTA: Esto probablemente NO funcionará, pero es mejor que nada
    console.warn(`⚠️ Using fallback URL for ${productId} - may not work`);
    return `https://pay.hotmart.com/${productId}`;
}

/**
 * Genera la URL de afiliado de un producto Hotmart
 * @param {string} productId - ID del producto o ucode
 * @param {string} affiliateCode - Código de afiliado (opcional)
 * @param {string} offerCode - Offer code real (opcional)
 * @returns {Promise<string>} URL de afiliado
 */
export async function generateAffiliateUrl(productId, affiliateCode = AFFILIATE_CODE, offerCode = null) {
    const salesUrl = await generateSalesUrl(productId, offerCode);
    return `${salesUrl}?ref=${affiliateCode}`;
}

/**
 * Genera la URL del marketplace de Hotmart
 * @param {string} productId - ID del producto
 * @returns {string} URL del marketplace
 */
export function generateMarketplaceUrl(productId) {
    const cleanId = productId.replace(/^HM-/, '');
    return `https://hotmart.com/marketplace/${cleanId}`;
}

/**
 * Extrae el ID del producto de una URL de Hotmart
 * @param {string} url - URL de Hotmart
 * @returns {string|null} ID del producto o null
 */
export function extractProductIdFromUrl(url) {
    if (!url) return null;
    
    const payMatch = url.match(/pay\.hotmart\.com\/([A-Z0-9]+)/i);
    if (payMatch) return payMatch[1];
    
    const marketMatch = url.match(/hotmart\.com\/marketplace\/([A-Z0-9]+)/i);
    if (marketMatch) return marketMatch[1];
    
    const productMatch = url.match(/hotmart\.com\/product\/([A-Z0-9]+)/i);
    if (productMatch) return productMatch[1];
    
    return null;
}

/**
 * Valida si una URL de Hotmart es válida
 * @param {string} url - URL a validar
 * @returns {boolean}
 */
export function isValidHotmartUrl(url) {
    if (!url) return false;
    
    const validPatterns = [
        /pay\.hotmart\.com\/[A-Z0-9]+/i,
        /hotmart\.com\/marketplace\/[A-Z0-9]+/i,
        /hotmart\.com\/product\/[A-Z0-9]+/i
    ];
    
    return validPatterns.some(pattern => pattern.test(url));
}

/**
 * Limpia el cache de offer codes
 */
export function clearOfferCodeCache() {
    offerCodeCache.clear();
}

export default {
    getOfferCodeFromAPI,
    generateSalesUrl,
    generateAffiliateUrl,
    generateMarketplaceUrl,
    extractProductIdFromUrl,
    isValidHotmartUrl,
    clearOfferCodeCache,
    AFFILIATE_CODE
};
