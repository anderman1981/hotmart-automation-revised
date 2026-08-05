/**
 * HotmartAPIClient - Cliente oficial para la API de Hotmart
 * 
 * Autenticación OAuth2 con Client Credentials
 * Docs: https://developers.hotmart.com/docs/
 */

const HOTMART_AUTH_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token';
const HOTMART_API_BASE = 'https://developers.hotmart.com';

class HotmartAPIClient {
    constructor() {
        this.clientId = process.env.HOTMART_CLIENT_ID;
        this.clientSecret = process.env.HOTMART_CLIENT_SECRET;
        this.tokenCache = null;
        this.tokenExpiry = 0;
    }

    /**
     * Verifica si las credenciales están configuradas
     */
    hasCredentials() {
        return !!(this.clientId && this.clientSecret);
    }

    /**
     * Obtiene un access token OAuth2
     * Token válido por 24 horas, se renueva automáticamente
     */
    async getAccessToken(forceRefresh = false) {
        // Verificar cache
        if (!forceRefresh && this.tokenCache && Date.now() < this.tokenExpiry) {
            return this.tokenCache;
        }

        if (!this.hasCredentials()) {
            throw new Error(
                'Hotmart API credentials not configured. ' +
                'Set HOTMART_CLIENT_ID and HOTMART_CLIENT_SECRET in .env. ' +
                'Get them from: Hotmart → Tools → Developer Tools → Credentials'
            );
        }

        try {
            const response = await fetch(HOTMART_AUTH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.clientId,
                    client_secret: this.clientSecret
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Hotmart auth failed (${response.status}): ${error}`);
            }

            const data = await response.json();
            
            // Cache token (renovar 5 min antes de expirar)
            this.tokenCache = data.access_token;
            this.tokenExpiry = Date.now() + ((data.expires_in || 86400) - 300) * 1000;
            
            console.log('✅ Hotmart API token obtained, expires in', data.expires_in, 'seconds');
            return this.tokenCache;
        } catch (error) {
            console.error('❌ Hotmart auth error:', error.message);
            throw error;
        }
    }

    /**
     * Realiza una petición autenticada a la API de Hotmart
     */
    async request(endpoint, options = {}) {
        const token = await this.getAccessToken();
        
        const url = endpoint.startsWith('http') ? endpoint : `${HOTMART_API_BASE}${endpoint}`;
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Hotmart API error (${response.status}): ${error}`);
        }

        return response.json();
    }

    /**
     * Lista todos los productos del productor/afiliado
     * GET /products/api/v1/products
     */
    async listProducts(params = {}) {
        const query = new URLSearchParams();
        if (params.status) query.set('status', params.status);
        if (params.maxResults) query.set('max_results', params.maxResults);
        if (params.pageToken) query.set('page_token', params.pageToken);
        
        const endpoint = `/products/api/v1/products${query.toString() ? '?' + query.toString() : ''}`;
        return this.request(endpoint);
    }

    /**
     * Obtiene las ofertas de un producto específico
     * GET /products/api/v1/products/:ucode/offers
     * 
     * @param {string} productUcode - UUID del producto (ej: "839F1A4F-43DC-F60F-13FE-6C8BD23F6781")
     * @returns {Promise<{items: Array<{code: string, name: string, price: object}>}>}
     */
    async getProductOffers(productUcode) {
        const endpoint = `/products/api/v1/products/${productUcode}/offers`;
        return this.request(endpoint);
    }

    /**
     * Obtiene el historial de ventas
     * GET /payments/api/v1/sales/history
     */
    async getSalesHistory(params = {}) {
        const query = new URLSearchParams();
        if (params.startDate) query.set('start_date', params.startDate);
        if (params.endDate) query.set('end_date', params.endDate);
        if (params.transactionStatus) query.set('transaction_status', params.transactionStatus);
        if (params.productId) query.set('product_id', params.productId);
        if (params.maxResults) query.set('max_results', params.maxResults);
        if (params.pageToken) query.set('page_token', params.pageToken);
        
        const endpoint = `/payments/api/v1/sales/history${query.toString() ? '?' + query.toString() : ''}`;
        return this.request(endpoint);
    }

    /**
     * Obtiene el resumen de ventas
     * GET /payments/api/v1/sales/summary
     */
    async getSalesSummary(params = {}) {
        const query = new URLSearchParams();
        if (params.startDate) query.set('start_date', params.startDate);
        if (params.endDate) query.set('end_date', params.endDate);
        if (params.productId) query.set('product_id', params.productId);
        
        const endpoint = `/payments/api/v1/sales/summary${query.toString() ? '?' + query.toString() : ''}`;
        return this.request(endpoint);
    }

    /**
     * Obtiene información de un producto específico por su ucode
     * GET /products/api/v1/products/:ucode
     */
    async getProduct(productUcode) {
        const endpoint = `/products/api/v1/products/${productUcode}`;
        return this.request(endpoint);
    }

    /**
     * Obtiene los planes de un producto
     * GET /products/api/v1/products/:ucode/plans
     */
    async getProductPlans(productUcode) {
        const endpoint = `/products/api/v1/products/${productUcode}/plans`;
        return this.request(endpoint);
    }

    /**
     * Valida las credenciales haciendo una petición de prueba
     */
    async validateCredentials() {
        try {
            await this.getAccessToken(true);
            return { valid: true, message: 'Credentials validated successfully' };
        } catch (error) {
            return { valid: false, message: error.message };
        }
    }
}

// Instancia singleton
const hotmartClient = new HotmartAPIClient();

export default hotmartClient;
export { HotmartAPIClient };
