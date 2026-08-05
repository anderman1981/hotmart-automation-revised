/**
 * HotmartURLGenerator - Genera URLs correctas de Hotmart
 * 
 * Formatos de URL correctos:
 * - Sales Page: https://pay.hotmart.com/XXXXXXXX
 * - Affiliate: https://pay.hotmart.com/XXXXXXXX?ref=XXXXXXXX
 * - Marketplace: https://hotmart.com/marketplace/XXXXXXXX
 */

const AFFILIATE_CODE = process.env.HOTMART_AFFILIATE_CODE || 'W949655431L';

/**
 * Genera la URL de venta de un producto Hotmart
 * @param {string} productId - ID del producto (ej: R94668718U, K94730729B)
 * @returns {string} URL de venta
 */
export function generateSalesUrl(productId) {
    const cleanId = productId.replace(/^HM-/, '');
    const salesId = cleanId.startsWith('R') ? cleanId : `R${cleanId}`;
    return `https://pay.hotmart.com/${salesId}`;
}

/**
 * Genera la URL de afiliado de un producto Hotmart
 * @param {string} productId - ID del producto
 * @param {string} affiliateCode - Código de afiliado (opcional)
 * @returns {string} URL de afiliado
 */
export function generateAffiliateUrl(productId, affiliateCode = AFFILIATE_CODE) {
    const salesUrl = generateSalesUrl(productId);
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

export default {
    generateSalesUrl,
    generateAffiliateUrl,
    generateMarketplaceUrl,
    extractProductIdFromUrl,
    isValidHotmartUrl,
    AFFILIATE_CODE
};
