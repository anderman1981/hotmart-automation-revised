import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Play, FileText, Send } from 'lucide-react';

const ProductSelection = ({ products, onBatchAction }) => {
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  
  const toggleSelection = (productId) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
    localStorage.setItem('selectedProducts', JSON.stringify([...newSelection]));
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
      localStorage.setItem('selectedProducts', JSON.stringify([]));
    } else {
      const allIds = new Set(products.map(p => p.id));
      setSelectedProducts(allIds);
      localStorage.setItem('selectedProducts', JSON.stringify([...allIds]));
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('selectedProducts');
    if (saved) {
      try {
        const savedIds = JSON.parse(saved);
        setSelectedProducts(new Set(savedIds));
      } catch (e) {
        console.error('Error parsing saved selections:', e);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {selectedProducts.size > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-white font-medium">
              {selectedProducts.size} producto{selectedProducts.size !== 1 ? 's' : ''} seleccionado{selectedProducts.size !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => onBatchAction('study', [...selectedProducts])}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <Play size={16} /> Analizar
              </button>
              <button 
                onClick={() => onBatchAction('generate', [...selectedProducts])}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <FileText size={16} /> Generar
              </button>
              <button 
                onClick={() => onBatchAction('publish', [...selectedProducts])}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <Send size={16} /> Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All */}
      <div className="flex items-center gap-4 p-3 bg-zinc-900/30 rounded-lg">
        <button onClick={handleSelectAll} className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors">
          {selectedProducts.size === products.length ? <CheckSquare size={20} /> : <Square size={20} />}
          <span>Seleccionar todos</span>
        </button>
        <span className="text-zinc-500 text-sm">
          {selectedProducts.size} de {products.length} seleccionados
        </span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className={`card-glass p-5 hover:border-orange-500/30 transition-all duration-300 group relative ${
            selectedProducts.has(product.id) ? 'border-orange-500/50 bg-orange-500/5' : ''
          }`}>
            <div className="flex justify-between items-start mb-4">
              <button
                onClick={() => toggleSelection(product.id)}
                className="text-white hover:text-orange-400 transition-colors"
              >
                {selectedProducts.has(product.id) ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              <div className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                {product.niche || 'General'}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
              {product.description || "Producto detectado en el mercado Hotmart."}
            </p>
            
            {/* Additional Info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">ID Hotmart:</span>
                <span className="text-zinc-400 font-mono">{product.hotmart_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Estado:</span>
                <span className={`font-mono ${
                  product.status === 'active' ? 'text-green-400' : 
                  product.status === 'testing' ? 'text-yellow-400' : 'text-zinc-400'
                }`}>
                  {product.status || 'Desconocido'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Score Prob.</span>
                <span className="text-orange-400 font-mono">
                  {(Math.random() * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Selection overlay */}
            {selectedProducts.has(product.id) && (
              <div className="absolute inset-0 bg-orange-500/10 border border-orange-500/30 rounded-lg pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSelection;