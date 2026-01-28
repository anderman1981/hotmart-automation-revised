import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Users, Star, ExternalLink, Shield, Clock, TrendingUp, AlertCircle } from 'lucide-react';

const ProductDetailModal = ({ productId, onClose, isOpen }) => {
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (isOpen && productId) {
            console.log('Modal opened for product:', productId);
            console.log('API URL from env:', import.meta.env.VITE_API_URL);
            fetchProductDetails();
        }
    }, [isOpen, productId]);

    const fetchProductDetails = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('Fetching product details for:', productId);
            console.log('API URL from env:', import.meta.env.VITE_API_URL);
            
            // First check authorization
            const authResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/hotmart/check-auth`);
            console.log('Auth response status:', authResponse.status);
            console.log('Auth response URL:', `${import.meta.env.VITE_API_URL}/api/hotmart/check-auth`);
            
            if (!authResponse.ok) {
                throw new Error(`Auth check failed: ${authResponse.status}`);
            }
            
            const authData = await authResponse.json();
            console.log('Auth data:', authData);
            
            if (!authData.authorized) {
                setAuthorized(false);
                setError('Se requiere autorización de Hotmart para ver detalles completos');
                setLoading(false);
                return;
            }
            
            setAuthorized(true);
            
            // Fetch detailed product information
            const detailResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/details`);
            console.log('Detail response status:', detailResponse.status);
            console.log('Detail response URL:', `${import.meta.env.VITE_API_URL}/api/products/${productId}/details`);
            
            if (!detailResponse.ok) {
                throw new Error(`No se pudieron obtener los detalles del producto: ${detailResponse.status}`);
            }
            
            const data = await detailResponse.json();
            console.log('Product details:', data);
            setProductDetails(data);
            
        } catch (err) {
            console.error('Error in fetchProductDetails:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const requestAuthorization = async () => {
        try {
            console.log('Requesting authorization...');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotmart/request-auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log('Auth request response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Auth request data:', data);
                // Open authorization window
                window.open(data.authUrl, '_blank', 'width=800,height=600');
            } else {
                throw new Error(`Authorization request failed: ${response.status}`);
            }
        } catch (err) {
            console.error('Error requesting authorization:', err);
            setError('Error al solicitar autorización');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-6 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Package className="text-orange-500 w-6 h-6" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">Detalles del Producto</h2>
                            <p className="text-zinc-400 text-sm mt-1">
                                Información extendida de Hotmart
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
                                Cargando detalles del producto...
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
                                <div>
                                    <h3 className="text-red-400 font-medium mb-2">Error</h3>
                                    <p className="text-zinc-300 mb-4">{error}</p>
                                    {!authorized && (
                                        <button
                                            onClick={requestAuthorization}
                                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Solicitar Autorización de Hotmart
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {productDetails && authorized && (
                        <div className="space-y-8">
                            {/* Product Header */}
                            <div className="flex items-start gap-6">
                                <div className="w-32 h-32 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
                                    {productDetails.product_image ? (
                                        <img 
                                            src={productDetails.product_image}
                                            alt={productDetails.product_image_alt || productDetails.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                const productName = productDetails.name || 'Producto';
                                                const encodedName = productName.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 20);
                                                e.target.src = `https://picsum.photos/seed/${encodedName}/400/300.jpg`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="text-zinc-600 w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-3xl font-bold text-white mb-2">
                                        {productDetails.name}
                                    </h3>
                                    <p className="text-zinc-400 text-lg mb-4">
                                        {productDetails.description}
                                    </p>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                                            {productDetails.category || 'Sin categoría'}
                                        </span>
                                        <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm font-medium">
                                            ID: {productDetails.hotmart_id}
                                        </span>
                                        {productDetails.rating && (
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-medium">{productDetails.rating}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <DollarSign className="text-green-500 w-5 h-5" />
                                        <span className="text-zinc-400 text-sm">Precio</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        ${productDetails.price?.toFixed(2) || 'N/A'}
                                    </div>
                                    {productDetails.currency && (
                                        <div className="text-zinc-500 text-sm mt-1">
                                            {productDetails.currency}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users className="text-blue-500 w-5 h-5" />
                                        <span className="text-zinc-400 text-sm">Estudiantes</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        {productDetails.students?.toLocaleString() || 'N/A'}
                                    </div>
                                    {productDetails.recent_sales && (
                                        <div className="text-green-500 text-sm mt-1">
                                            +{productDetails.recent_sales} ventas recientes
                                        </div>
                                    )}
                                </div>

                                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp className="text-purple-500 w-5 h-5" />
                                        <span className="text-zinc-400 text-sm">Conversión</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        {productDetails.conversion_rate ? `${productDetails.conversion_rate}%` : 'N/A'}
                                    </div>
                                    {productDetails.conversion_trend && (
                                        <div className={`text-sm mt-1 ${
                                            productDetails.conversion_trend === 'up' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            {productDetails.conversion_trend === 'up' ? '↑' : '↓'} Tendencia
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Information */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Sales Information */}
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <DollarSign className="text-green-500 w-5 h-5" />
                                        Información de Ventas
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                            <span className="text-zinc-400">Comisión Afiliado</span>
                                            <span className="text-white font-medium">
                                                {productDetails.commission_rate ? `${productDetails.commission_rate}%` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                            <span className="text-zinc-400">Precio Promocional</span>
                                            <span className="text-white font-medium">
                                                ${productDetails.promotional_price?.toFixed(2) || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                            <span className="text-zinc-400">Garantía</span>
                                            <span className="text-white font-medium">
                                                {productDetails.warranty_days ? `${productDetails.warranty_days} días` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-zinc-400">Soporte</span>
                                            <span className={`font-medium ${
                                                productDetails.has_support ? 'text-green-500' : 'text-zinc-500'
                                            }`}>
                                                {productDetails.has_support ? 'Disponible' : 'No disponible'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Features */}
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Package className="text-orange-500 w-5 h-5" />
                                        Características del Producto
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                            <span className="text-zinc-400">Duración</span>
                                            <span className="text-white font-medium">
                                                {productDetails.duration || 'Ilimitado'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                            <span className="text-zinc-400">Idiomas</span>
                                            <span className="text-white font-medium">
                                                {productDetails.languages?.join(', ') || 'Español'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                            <span className="text-zinc-400">Actualizaciones</span>
                                            <span className={`font-medium ${
                                                productDetails.has_updates ? 'text-green-500' : 'text-zinc-500'
                                            }`}>
                                                {productDetails.has_updates ? 'Incluidas' : 'No incluidas'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-zinc-400">Certificado</span>
                                            <span className={`font-medium ${
                                                productDetails.has_certificate ? 'text-green-500' : 'text-zinc-500'
                                            }`}>
                                                {productDetails.has_certificate ? 'Disponible' : 'No disponible'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Preview */}
                            {productDetails.content_preview && (
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Package className="text-orange-500 w-5 h-5" />
                                        Contenido del Producto
                                    </h4>
                                    <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-6">
                                        <div className="text-zinc-300 leading-relaxed">
                                            {productDetails.content_preview}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Affiliate Status Warning */}
                            {productDetails.affiliate_status === 'pending' && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="text-yellow-500 w-5 h-5 mt-0.5" />
                                        <div>
                                            <h4 className="text-yellow-400 font-medium mb-2">Estado de Afiliación: Pendiente</h4>
                                            <p className="text-zinc-300 text-sm mb-3">
                                                Este producto aún no está configurado como afiliado. El enlace de afiliado se generará una vez que complete el proceso de registro en Hotmart.
                                            </p>
                                            <div className="bg-zinc-800/50 rounded-lg p-3">
                                                <p className="text-zinc-400 text-xs mb-2">
                                                    <strong>Para habilitar este producto como afiliado:</strong>
                                                </p>
                                                <ol className="text-zinc-400 text-xs space-y-1 list-decimal list-inside">
                                                    <li>Inicie sesión en su cuenta Hotmart</li>
                                                    <li>Navegue al área de afiliados</li>
                                                    <li>Busque este producto por ID: <code className="bg-zinc-700 px-2 py-1 rounded text-yellow-400">{productDetails.hotmart_id}</code></li>
                                                    <li>Active la promoción y genere su enlace único</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-6 border-t border-zinc-800">
                                <a
                                    href={productDetails.sales_page_url || productDetails.url_sales_page}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Ir a Página del Producto
                                </a>
                                {productDetails.affiliate_status === 'active' ? (
                                    <a
                                        href={productDetails.affiliate_url || productDetails.url_sales_page + '?ref=W949655431L'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        Enlace de Afiliado ✅
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="flex items-center gap-2 px-6 py-3 bg-zinc-700 text-zinc-400 rounded-lg font-medium cursor-not-allowed"
                                        title="Regístrese como afiliado en Hotmart para activar este enlace"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        Enlace de Afiliado 🔒
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;