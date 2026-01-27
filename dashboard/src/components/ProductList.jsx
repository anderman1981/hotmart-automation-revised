import React, { useState, useEffect, useRef } from 'react';
import { Package, Clock, TrendingUp, AlertCircle, CheckCircle, Activity, Search, Database, Zap, RefreshCw } from 'lucide-react';

const ProductList = ({ isScanning = false, scanProgress = 0, scanResult = null }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [lastUpdated, setLastUpdated] = useState(null);
    const pollingRef = useRef(null);
    const scanIntervalRef = useRef(null);

    // Fetch products from API with enhanced error handling
    const fetchProducts = async (forceRefresh = false) => {
        try {
            if (!forceRefresh) setLoading(true);
            setError(null);
            
            // Aggressive cache busting
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            const cacheBuster = `t=${timestamp}&r=${random}&force=${forceRefresh ? 1 : 0}`;
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products?${cacheBuster}`, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const productsList = data.products || [];
            
            setProducts(productsList);
            setLastUpdated(new Date());
            
            console.log('📦 Products loaded:', {
                count: productsList.length,
                timestamp: new Date().toISOString(),
                source: forceRefresh ? 'forced_refresh' : 'initial_load',
                cacheBuster: random
            });
            
            // Force React re-render if we have new data
            if (forceRefresh && productsList.length > 0) {
                setTimeout(() => {
                    setProducts([...productsList]);
                }, 100);
            }
            
            return productsList;
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.message);
            setProducts([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Enhanced polling with faster updates during scanning
    const startRealtimeUpdates = () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        
        // Faster polling during scanning (every 2 seconds)
        pollingRef.current = setInterval(async () => {
            try {
                // Add random cache-buster
                const cacheBuster = `t=${Date.now()}&r=${Math.random()}`;
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products?${cacheBuster}`, {
                    cache: 'no-cache',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                const data = await response.json();
                const newProducts = data.products || [];
                
                console.log(`🔄 Polling check: ${newProducts.length} products found`);
                
                // Always update during scanning to ensure we get new data
                setProducts(prevProducts => {
                    const hasChanges = prevProducts.length !== newProducts.length || 
                                     JSON.stringify(prevProducts.map(p => p.id)) !== JSON.stringify(newProducts.map(p => p.id));
                    
                    if (hasChanges || isScanning) {
                        console.log('🔄 Products updated:', {
                            from: prevProducts.length,
                            to: newProducts.length,
                            hasChanges
                        });
                        return newProducts;
                    }
                    return prevProducts;
                });
                
                setLastUpdated(new Date());
            } catch (error) {
                console.log('Realtime update error:', error);
            }
        }, 1500); // Faster polling: every 1.5 seconds during scanning
    };

    // Stop real-time updates
    const stopRealtimeUpdates = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    // Force refresh after scan completion
    const refreshAfterScan = () => {
        console.log('🔄 Starting aggressive refresh after scan');
        
        // Clear products first to trigger loading state
        setProducts([]);
        
        // Multiple refresh attempts with different intervals
        const refreshAttempts = [
            { delay: 500, label: 'first' },
            { delay: 1500, label: 'second' },
            { delay: 3000, label: 'third' },
            { delay: 6000, label: 'fourth' },
            { delay: 10000, label: 'final' }
        ];
        
        refreshAttempts.forEach(({ delay, label }) => {
            setTimeout(() => {
                console.log(`🔄 Refresh attempt ${label} at ${delay}ms`);
                fetchProducts(true);
            }, delay);
        });
        
        // Also trigger stats refresh to notify other components
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('dataRefreshed', {
                detail: { source: 'productList', timestamp: Date.now() }
            }));
        }, 2000);
    };

    // Initial load
    useEffect(() => {
        fetchProducts();
        
        return () => {
            stopRealtimeUpdates();
        };
    }, []);

    // Handle scanning state changes with better timing
    useEffect(() => {
        if (isScanning) {
            console.log('🚀 Starting realtime updates for scanning');
            startRealtimeUpdates();
        } else {
            console.log('🛑 Stopping realtime updates');
            stopRealtimeUpdates();
            
            // Aggressive refresh when scanning stops
            if (scanResult && scanResult.new_products > 0) {
                console.log('🎉 Scan completed with new products, forcing refresh');
                refreshAfterScan();
            } else {
                setTimeout(() => fetchProducts(true), 2000);
            }
        }
    }, [isScanning, scanResult]);

    // Listen for scan results from parent
    useEffect(() => {
        if (scanResult && scanResult.new_products > 0) {
            console.log('📊 Scan result received:', scanResult);
            refreshAfterScan();
        }
    }, [scanResult]);

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
        if (!price) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    // Manual refresh button
    const handleManualRefresh = () => {
        console.log('🔄 Manual refresh triggered');
        fetchProducts(true);
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
                    onClick={() => fetchProducts(true)}
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
                        {scanResult && ` · Encontrados ${scanResult.new_products} nuevos`}
                        {lastUpdated && ` · Última actualización: ${lastUpdated.toLocaleTimeString()}`}
                    </p>
                </div>
                
                <div className="flex gap-3">
                    {/* Manual refresh */}
                    <button
                        onClick={handleManualRefresh}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Actualizar manualmente"
                    >
                        <RefreshCw className="h-4 w-4 text-gray-600" />
                    </button>
                    
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

            {/* Scan progress indicator */}
            {isScanning && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        <span className="text-blue-700 font-medium">Escaneo en progreso: {scanProgress}%</span>
                        {scanResult && scanResult.new_products > 0 && (
                            <span className="text-green-600 font-medium">
                                ✓ {scanResult.new_products} nuevos productos encontrados
                            </span>
                        )}
                    </div>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                        <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${scanProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

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

            {/* Status indicator */}
            {lastUpdated && !loading && (
                <div className="mt-4 text-center text-xs text-gray-500">
                    Última actualización: {lastUpdated.toLocaleString()}
                </div>
            )}
        </div>
    );
};

export default ProductList;