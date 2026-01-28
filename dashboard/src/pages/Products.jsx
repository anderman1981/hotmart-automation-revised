import React, { useState, useEffect } from 'react';
import { Package, Snowflake, Trash2, CheckSquare, Square, Eye, RefreshCw } from 'lucide-react';
import ProductDetailModal from '../components/ProductDetailModal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [activeView, setActiveView] = useState('active'); // 'active', 'freezer', 'all'
    const [modalProduct, setModalProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Helper functions - MOVED BEFORE JSX
    const toggleProductSelection = (productId) => {
        const newSelection = new Set(selectedProducts);
        if (newSelection.has(productId)) {
            newSelection.delete(productId);
        } else {
            newSelection.add(productId);
        }
        setSelectedProducts(newSelection);
    };

    const moveToFreezer = async () => {
        try {
            const productIds = Array.from(selectedProducts);
            
            // Call API to move products to freezer
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/move-to-freezer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds })
            });
            
            if (response.ok) {
                // Update local state
                setProducts(products.map(p => 
                    productIds.includes(p.id) 
                        ? { ...p, status: 'cold', cold_moved_at: new Date().toISOString() }
                        : p
                ));
                setSelectedProducts(new Set());
            }
        } catch (error) {
            console.error('Error moving products to freezer:', error);
        }
    };

    const reactivateProducts = async () => {
        try {
            const productIds = Array.from(selectedProducts);
            
            // Call API to reactivate products
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/reactivate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds })
            });
            
            if (response.ok) {
                // Update local state
                setProducts(products.map(p => 
                    productIds.includes(p.id) 
                        ? { ...p, status: 'testing', reactivated_at: new Date().toISOString() }
                        : p
                ));
                setSelectedProducts(new Set());
            }
        } catch (error) {
            console.error('Error reactivating products:', error);
        }
    };

    useEffect(() => {
        // Fetch products on component mount
        fetchProducts();
        
        // Set up polling for real-time updates
        const interval = setInterval(fetchProducts, 10000); // Check every 10 seconds
        
        // Listen for custom scan completion events
        const handleScanComplete = (event) => {
            console.log('Scan completed, refreshing products...');
            fetchProducts();
        };
        
        window.addEventListener('scanComplete', handleScanComplete);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('scanComplete', handleScanComplete);
        };
    }, []);

    const fetchProducts = () => {
        fetch(import.meta.env.VITE_API_URL + '/api/products')
            .then(res => res.json())
            .then(data => {
                // Handle both direct array and wrapped response
                const products = Array.isArray(data) ? data : data.products || [];
                if (products.length > 0) {
                    setProducts(products);
                    console.log(`✅ Loaded ${products.length} products`);
                } else {
                    console.warn("No products found:", data);
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch products", err);
                setProducts([]);
                setLoading(false);
            });
    };

    return (
        <div className="animate-fade-in">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/10 rounded-2xl p-6 mb-8 border border-orange-500/20 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Package className="text-orange-500" />
                                Escáner de Productos
                            </h2>
                            <button
                                onClick={() => {
                                    setRefreshing(true);
                                    fetchProducts();
                                    setTimeout(() => setRefreshing(false), 1000);
                                }}
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all duration-200"
                                title="Refresh products"
                            >
                                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <p className="text-zinc-400">
                            Monitorea y gestiona tu catálogo de productos Hotmart • {products.length} productos cargados
                        </p>
                    </div>
                    
                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl font-bold text-emerald-400">
                                {products?.filter(p => p.status === 'active').length || 0}
                            </div>
                            <div className="text-xs text-zinc-400">Activos</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl font-bold text-blue-400">
                                {products?.filter(p => p.status === 'testing').length || 0}
                            </div>
                            <div className="text-xs text-zinc-400">Testing</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl font-bold text-blue-300">
                                {products?.filter(p => p.status === 'cold').length || 0}
                            </div>
                            <div className="text-xs text-zinc-400">Freezer</div>
                        </div>
                    </div>
                </div>
                 
                {/* View Tabs */}
                <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-lg mt-6 max-w-md">
                    <button
                        onClick={() => setActiveView('active')}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                            activeView === 'active' 
                                ? 'bg-orange-500 text-white shadow-lg' 
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                    >
                        Activos
                    </button>
                    <button
                        onClick={() => setActiveView('freezer')}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            activeView === 'freezer' 
                                ? 'bg-blue-500 text-white shadow-lg' 
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                    >
                        <Snowflake className="w-4 h-4" />
                        Freezer
                    </button>
                    <button
                        onClick={() => setActiveView('all')}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                            activeView === 'all' 
                                ? 'bg-zinc-700 text-white shadow-lg' 
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                    >
                        Todos
                    </button>
                </div>
            </div>

             {/* Batch Actions */}
             {selectedProducts.size > 0 && (
                 <div className="mb-6 p-6 bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 border border-zinc-700 rounded-xl backdrop-blur-sm shadow-xl">
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                 <span className="text-orange-400 font-bold text-sm">{selectedProducts.size}</span>
                             </div>
                             <div>
                                 <div className="text-white font-medium">productos seleccionados</div>
                                 <div className="text-zinc-400 text-sm">
                                     {activeView === 'active' ? 'Listos para mover al freezer' : 
                                      activeView === 'freezer' ? 'Listos para reactivar' : 
                                      'Realiza acciones en lote'}
                                 </div>
                             </div>
                         </div>
                         <div className="flex gap-3">
                             {activeView === 'active' && (
                                 <button
                                     onClick={() => moveToFreezer()}
                                     className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-105"
                                 >
                                     <Snowflake className="w-4 h-4" />
                                     Mover al Freezer
                                 </button>
                             )}
                             {activeView === 'freezer' && (
                                 <button
                                     onClick={() => reactivateProducts()}
                                     className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-105"
                                 >
                                     Reactivar
                                 </button>
                             )}
                             <button
                                 onClick={() => setSelectedProducts(new Set())}
                                 className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                             >
                                 Limpiar selección
                             </button>
                         </div>
                     </div>
                 </div>
             )}

            {loading ? (
                <div className="text-zinc-500 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
                    Cargando datos del agente...
                </div>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(!products || products.length === 0) ? (
                        <div className="col-span-full text-center py-20">
                            <div className="max-w-md mx-auto">
                                <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-zinc-400 mb-2">
                                    No se han detectado productos aún
                                </h3>
                                <p className="text-zinc-500">
                                    El agente está ejecutando su ronda de exploración. 
                                    Vuelve a revisar en unos minutos.
                                </p>
                            </div>
                        </div>
                    ) : (
                        products.filter(product => {
                            if (activeView === 'active') return product.status !== 'cold'; // Include tracking, testing, active
                            if (activeView === 'freezer') return product.status === 'cold';
                            return true; // 'all'
                        }).map((p) => (
                            <div key={p.id} className={`card-glass p-6 hover:border-orange-500/30 transition-all duration-300 group relative hover:shadow-2xl ${
                                p.status === 'cold' ? 'border-blue-500/30 bg-blue-950/20' : ''
                            }`}>
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-start gap-3">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleProductSelection(p.id)}
                                            className="mt-1 p-1.5 rounded-lg hover:bg-zinc-800 transition-all duration-200"
                                        >
                                            {selectedProducts.has(p.id) ? (
                                                <CheckSquare className="w-5 h-5 text-orange-500" />
                                            ) : (
                                                <Square className="w-5 h-5 text-zinc-400" />
                                            )}
                                        </button>
                                        
                                        {/* Status indicator */}
                                        <div className={`w-3 h-3 rounded-full ${
                                            p.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                            p.status === 'testing' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                                            p.status === 'cold' ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' :
                                            'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                                        }`}></div>
                                    </div>
                                     
                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {/* Frozen Icon */}
                                        {p.status === 'cold' && (
                                            <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30">
                                                <Snowflake className="w-3 h-3" />
                                                Freezer
                                            </div>
                                        )}
                                        
                                        {/* View Details Button */}
                                        <button
                                            onClick={() => {
                                                setModalProduct(p.id);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all duration-200 hover:scale-105"
                                            title="Ver detalles completos"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Niche badge */}
                                <div className="mb-3">
                                    <span className="text-xs font-mono text-zinc-500 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-800">
                                        {p.niche || 'General'}
                                    </span>
                                </div>
                                
                                {/* Title and Description */}
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors line-clamp-2">
                                    {p.name}
                                </h3>
                                <p className="text-sm text-zinc-400 mb-5 line-clamp-3 leading-relaxed">
                                    {p.description || "Producto detectado en el mercado Hotmart."}
                                </p>
                                
                                {/* Metrics */}
                                <div className="space-y-3">
                                    {/* Performance Score */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500 text-sm font-medium">Rendimiento</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-zinc-800 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-500 ${
                                                        p.performance_score >= 70 ? 'bg-emerald-500' : 
                                                        p.performance_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${Math.min(p.performance_score || 50, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className={`font-mono font-bold text-sm ${
                                                p.performance_score >= 70 ? 'text-emerald-400' : 
                                                p.performance_score >= 40 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                                {parseFloat(p.performance_score || 50).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Commission Rate */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500 text-sm font-medium">Comisión</span>
                                        <span className="text-green-400 font-bold text-sm">
                                            {p.affiliate_commission || 40}%
                                        </span>
                                    </div>
                                     
                                    {/* Cold products info */}
                                    {p.status === 'cold' && (
                                        <div className="pt-3 border-t border-zinc-800">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-blue-400">Congelado hace:</span>
                                                <span className="text-blue-300 text-xs">
                                                    {p.cold_moved_at ? 
                                                        `${Math.floor((Date.now() - new Date(p.cold_moved_at)) / (1000 * 60 * 60 * 24))} días` 
                                                        : 'N/A'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Hotmart Link */}
                                    <div className="pt-3 border-t border-zinc-800">
                                        <a
                                            href={p.url_sales_page}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between text-xs text-zinc-500 hover:text-orange-400 transition-colors"
                                        >
                                            <span>Ver en Hotmart</span>
                                            <span className="font-mono">{p.hotmart_id?.slice(-8) || 'ID'}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            
            {/* Product Detail Modal */}
            <ProductDetailModal
                productId={modalProduct}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalProduct(null);
                }}
                isOpen={isModalOpen}
            />
        </div>
    );
};

export default Products;
