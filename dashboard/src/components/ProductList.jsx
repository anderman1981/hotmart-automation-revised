import React, { useState, useEffect, useRef } from 'react';
import { Package, Clock, TrendingUp, AlertCircle, CheckCircle, Activity, Search, Database, Zap } from 'lucide-react';

const ProductList = ({ isScanning = false, scanProgress = 0 }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const pollingRef = useRef(null);
    const scanIntervalRef = useRef(null);

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setProducts(data.products || []);
            console.log('📦 Products loaded:', data.products?.length || 0);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.message);
            // Set empty products on error
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Poll for real-time updates during scanning
    const startRealtimeUpdates = () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        
        pollingRef.current = setInterval(async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
                const data = await response.json();
                setProducts(data.products || []);
            } catch (error) {
                console.log('Realtime update error:', error);
            }
        }, 3000); // Poll every 3 seconds during scanning
    };

    // Stop real-time updates
    const stopRealtimeUpdates = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    // Initial load and updates
    useEffect(() => {
        fetchProducts();
        
        return () => {
            stopRealtimeUpdates();
        };
    }, []);

    // Handle scanning state changes
    useEffect(() => {
        if (isScanning) {
            startRealtimeUpdates();
        } else {
            stopRealtimeUpdates();
            // Final refresh when scanning stops
            setTimeout(fetchProducts, 2000);
        }
    }, [isScanning]);

    // Filter products based on search and status
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.niche?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    // Get status icon and color
    const getStatusInfo = (status) => {
        switch (status) {
            case 'active':
            case 'tracking':
                return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', text: 'Activo' };
            case 'testing':
                return { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-100', text: 'Testing' };
            case 'cold':
                return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', text: 'Inactivo' };
            case 'pending':
                return { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-100', text: 'Pendiente' };
            default:
                return { icon: Package, color: 'text-gray-500', bg: 'bg-gray-100', text: status };
        }
    };

    // Format price
    const formatPrice = (price) => {
        if (!price) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    if (loading && !products.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-600">Cargando productos...</span>
            </div>
        );
    }

    if (error && !products.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                <p className="text-red-600 font-medium">Error al cargar productos</p>
                <p className="text-gray-500 text-sm mt-1">{error}</p>
                <button 
                    onClick={fetchProducts}
                    className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header with search and filters */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Productos Hotmart</h2>
                    <p className="text-gray-600 mt-1">
                        {filteredProducts.length} de {products.length} productos
                        {isScanning && ` · Escaneando ${scanProgress}%`}
                    </p>
                </div>
                
                <div className="flex gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    
                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="testing">Testing</option>
                        <option value="cold">Inactivos</option>
                        <option value="pending">Pendientes</option>
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                    const statusInfo = getStatusInfo(product.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                        <div key={product.id || product.hotmart_id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                                    {product.name || 'Sin nombre'}
                                </h3>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusInfo.text}
                                </span>
                            </div>
                            
                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {product.description || 'Sin descripción'}
                            </p>
                            
                            {/* Product Details */}
                            <div className="space-y-2 text-sm">
                                {product.price && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Precio:</span>
                                        <span className="font-medium text-gray-900">{formatPrice(product.price)}</span>
                                    </div>
                                )}
                                
                                {product.niche && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Categoría:</span>
                                        <span className="text-gray-900 capitalize">{product.niche}</span>
                                    </div>
                                )}
                                
                                {product.performance_score && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Score:</span>
                                        <span className="text-gray-900">{Math.round(product.performance_score)}%</span>
                                    </div>
                                )}
                                
                                {product.created_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Creado:</span>
                                        <span className="text-gray-900">
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="mt-4 flex gap-2">
                                {product.url_sales_page && (
                                    <a
                                        href={product.url_sales_page}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-center px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        Ver Producto
                                    </a>
                                )}
                                
                                {product.selected_for_tracking && (
                                    <button 
                                        className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Seleccionado para seguimiento"
                                    >
                                        <TrendingUp className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm || filterStatus !== 'all' ? 'No hay productos que coincidan' : 'No hay productos disponibles'}
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm ? 'Intenta con otra búsqueda' : 
                         filterStatus !== 'all' ? 'Intenta con otro filtro' : 
                         'Inicia un escaneo para descubrir productos'}
                    </p>
                </div>
            )}

            {/* Loading overlay during updates */}
            {loading && products.length > 0 && (
                <div className="fixed top-0 right-0 p-4">
                    <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        <span className="text-sm text-gray-600">Actualizando...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;