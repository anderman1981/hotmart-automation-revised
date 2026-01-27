import React, { useState, useEffect, useRef } from 'react';
import { Package, Clock, TrendingUp, AlertCircle, CheckCircle, Activity } from 'lucide-react';

const ProductList = ({ isScanning = false, scanProgress = 0 }) => {
    const [products, setProducts] = useState([]);
    const [totalFound, setTotalFound] = useState(0);
    const [realtimeUpdates, setRealtimeUpdates] = useState([]);
    const pollingRef = useRef(null);

    // Efecto para manejar el polling en tiempo real durante el scraping
    useEffect(() => {
        if (isScanning) {
            // Iniciar polling cada 2 segundos durante el scraping
            pollingRef.current = setInterval(async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/scanning/progress`);
                    const data = await response.json();
                    
                    if (data.success) {
                        setProducts(data.current_products || []);
                        setTotalFound(data.total_found || 0);
                        
                        // Agregar nuevas actualizaciones a la lista
                        if (data.new_updates && data.new_updates.length > 0) {
                            setRealtimeUpdates(prev => [...data.new_updates, ...prev].slice(0, 10));
                        }
                    }
                } catch (error) {
                    console.error('Error fetching scan progress:', error);
                }
            }, 2000);
        } else {
            // Limpiar polling cuando no se está escaneando
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [isScanning]);

    // Efecto para cargar productos iniciales
    useEffect(() => {
        const loadInitialProducts = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products?limit=20`);
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    setProducts(data.slice(0, 10)); // Mostrar solo los 10 más recientes
                    setTotalFound(data.length);
                }
            } catch (error) {
                console.error('Error loading initial products:', error);
            }
        };

        loadInitialProducts();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processing':
                return <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-blue-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'processing':
                return 'Procesando...';
            case 'completed':
                return 'Completado';
            case 'error':
                return 'Error';
            default:
                return 'Detectado';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header con contador y progreso */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Package className="text-orange-500 w-6 h-6" />
                        <div>
                            <h3 className="text-xl font-bold text-white">Productos en Tiempo Real</h3>
                            <p className="text-zinc-400 text-sm">
                                {isScanning ? 'Monitoreando scraping activo' : 'Últimos productos detectados'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white">{totalFound}</div>
                        <div className="text-sm text-zinc-400">
                            {isScanning ? 'productos encontrados' : 'productos totales'}
                        </div>
                    </div>
                </div>

                {/* Barra de progreso */}
                {isScanning && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Progreso del scraping</span>
                            <span className="text-orange-400 font-medium">{scanProgress}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${scanProgress}%` }}
                            >
                                <div className="h-full bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de productos en tiempo real */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Productos actuales */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Package className="text-orange-500 w-5 h-5" />
                        Productos Detectados
                        {isScanning && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        )}
                    </h4>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {products.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                                {isScanning ? 'Buscando productos...' : 'No hay productos para mostrar'}
                            </div>
                        ) : (
                            products.map((product, index) => (
                                <div 
                                    key={product.id || index}
                                    className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-orange-500/30 transition-all hover:scale-[1.02] animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusIcon(product.status)}
                                                <h5 className="font-medium text-white truncate">{product.name}</h5>
                                            </div>
                                            
                                            <p className="text-sm text-zinc-400 line-clamp-2 mb-2">
                                                {product.description || 'Producto detectado automáticamente'}
                                            </p>
                                            
                                            <div className="flex items-center gap-4 text-xs">
                                                {product.price && (
                                                    <span className="text-green-400 font-medium">
                                                        ${parseFloat(product.price).toFixed(2)}
                                                    </span>
                                                )}
                                                
                                                {product.category && (
                                                    <span className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                                                        {product.category}
                                                    </span>
                                                )}
                                                
                                                <span className="text-zinc-500">
                                                    {getStatusText(product.status)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {product.score && (
                                            <div className="text-right flex-shrink-0">
                                                <div className={`text-lg font-bold ${
                                                    product.score >= 70 ? 'text-green-400' : 
                                                    product.score >= 40 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                    {parseFloat(product.score).toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-zinc-500">Score</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Actualizaciones en tiempo real */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity className="text-green-500 w-5 h-5" />
                        Actividad Reciente
                        {isScanning && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        )}
                    </h4>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {realtimeUpdates.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                                {isScanning ? 'Esperando actividad...' : 'Sin actividad reciente'}
                            </div>
                        ) : (
                            realtimeUpdates.map((update, index) => (
                                <div 
                                    key={`${update.timestamp}-${index}`}
                                    className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3 animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start gap-3">
                                        {getStatusIcon(update.type)}
                                        <div className="flex-1">
                                            <p className="text-sm text-zinc-300">{update.message}</p>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                {new Date(update.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Estilos inline */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(251, 146, 60, 0.3);
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(251, 146, 60, 0.5);
                }
                
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ProductList;