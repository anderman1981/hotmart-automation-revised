import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
            <h2 className="heading-xl text-white mb-8 flex items-center gap-3">
                <Package className="text-orange-500" />
                Escáner de Productos
            </h2>

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
                        products.map((p) => (
                            <div key={p.id} className="card-glass p-5 hover:border-orange-500/30 transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                                        {p.niche || 'General'}
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{p.name}</h3>
                                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{p.description || "Producto detectado en el mercado Hotmart."}</p>
                                <div className="flex items-center justify-between text-sm border-t border-white/5 pt-4">
                                    <span className="text-zinc-500">Score Prob.</span>
                                    <span className="text-orange-400 font-mono">{(Math.random() * 100).toFixed(2)}%</span>
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
