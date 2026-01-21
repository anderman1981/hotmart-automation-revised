import React, { useState, useEffect } from 'react';
import { Package, Snowflake, Trash2, CheckSquare, Square } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [activeView, setActiveView] = useState('active'); // 'active', 'freezer', 'all'

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
        // Fetch products
        fetch(import.meta.env.VITE_API_URL + '/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.error("API returned non-array:", data);
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch products", err);
                setProducts([]);
                setLoading(false);
            });
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h2 className="heading-xl text-white flex items-center gap-3">
                    <Package className="text-orange-500" />
                    Escáner de Productos
                </h2>
                
                {/* View Tabs */}
                <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveView('active')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeView === 'active' 
                                ? 'bg-orange-500 text-white' 
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Activos
                    </button>
                    <button
                        onClick={() => setActiveView('freezer')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                            activeView === 'freezer' 
                                ? 'bg-blue-500 text-white' 
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <Snowflake className="w-4 h-4" />
                        Freezer
                    </button>
                    <button
                        onClick={() => setActiveView('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeView === 'all' 
                                ? 'bg-zinc-700 text-white' 
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Todos
                    </button>
                </div>
            </div>

            {/* Batch Actions */}
            {selectedProducts.size > 0 && (
                <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center justify-between">
                    <div className="text-zinc-300">
                        <span className="font-medium">{selectedProducts.size}</span> productos seleccionados
                    </div>
                    <div className="flex gap-3">
                        {activeView === 'active' && (
                            <button
                                onClick={() => moveToFreezer()}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Snowflake className="w-4 h-4" />
                                Mover al Freezer
                            </button>
                        )}
                        {activeView === 'freezer' && (
                            <button
                                onClick={() => reactivateProducts()}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                Reactivar
                            </button>
                        )}
                        <button
                            onClick={() => setSelectedProducts(new Set())}
                            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Limpiar selección
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-zinc-500">Cargando datos del agente...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(!products || products.length === 0) ? (
                        <div className="col-span-full text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                            No se han detectado productos aún. <br />
                            El agente está ejecutando su ronda de exploración.
                        </div>
                    ) : (
                        products.filter(product => {
                            if (activeView === 'active') return product.status !== 'cold';
                            if (activeView === 'freezer') return product.status === 'cold';
                            return true; // 'all'
                        }).map((p) => (
                            <div key={p.id} className={`card-glass p-5 hover:border-orange-500/30 transition-colors group relative ${
                                p.status === 'cold' ? 'border-blue-500/30 bg-blue-950/20' : ''
                            }`}>
                                <div className="flex justify-between items-start mb-4">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleProductSelection(p.id)}
                                        className="mr-3 p-1 rounded hover:bg-zinc-800 transition-colors"
                                    >
                                        {selectedProducts.has(p.id) ? (
                                            <CheckSquare className="w-5 h-5 text-orange-500" />
                                        ) : (
                                            <Square className="w-5 h-5 text-zinc-400" />
                                        )}
                                    </button>
                                    
                                    {/* Frozen Icon */}
                                    {p.status === 'cold' && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                                            <Snowflake className="w-3 h-3" />
                                            Freezer
                                        </div>
                                    )}
                                    <div className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                                        {p.niche || 'General'}
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{p.name}</h3>
                                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{p.description || "Producto detectado en el mercado Hotmart."}</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm border-t border-white/5 pt-4">
                                        <span className="text-zinc-500">Score Prob.</span>
                                        <span className={`font-mono font-bold ${
                                            p.performance_score >= 70 ? 'text-green-400' : 
                                            p.performance_score >= 40 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                            {parseFloat(p.performance_score || 50).toFixed(1)}%
                                        </span>
                                    </div>
                                    
                                    {p.status === 'cold' && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-500">Congelado:</span>
                                            <span className="text-blue-400 text-xs">
                                                {p.cold_moved_at ? new Date(p.cold_moved_at).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Products;
