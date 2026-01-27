import React, { useState, useEffect, useRef } from 'react';
import { Package, Clock, TrendingUp, AlertCircle, CheckCircle, Activity, Search, Database, Zap } from 'lucide-react';

const ProductList = ({ isScanning = false, scanProgress = 0 }) => {
    const [products, setProducts] = useState([]);
    const [totalFound, setTotalFound] = useState(0);
    const [realtimeUpdates, setRealtimeUpdates] = useState([]);
    const [currentScanCount, setCurrentScanCount] = useState(0);
    const pollingRef = useRef(null);
    const scanIntervalRef = useRef(null);

    // Base de productos de muestra para simulación
    const sampleProducts = [
        {
            name: "Excel para Negocios",
            description: "Super Mega Pack de Cursos Online con más de 1000 cursos y e-books en múltiples categorías. Acceso de por vida sin restricciones.",
            price: 47.00,
            category: "Productividad",
            score: 85,
            status: "detected"
        },
        {
            name: "Curso de Manicure Ruso",
            description: "Academia de Traffickers Digital diseñada para dominar el tráfico pago y ver resultados concretos.",
            price: 97.00,
            category: "Belleza",
            score: 78,
            status: "detected"
        },
        {
            name: "The Secret Of Digital 1.0",
            description: "Curso completo de Marketing Digital con más de 90 módulos, acceso de por vida y comunidad exclusiva.",
            price: 197.00,
            category: "Marketing",
            score: 92,
            status: "detected"
        },
        {
            name: "Negocio de la Sublimacion",
            description: "Curso de Marketing Digital con derechos de reventa, acceso en 6 idiomas y comunidad privada.",
            price: 37.00,
            category: "Negocios",
            score: 73,
            status: "detected"
        },
        {
            name: "Cake Designer",
            description: "Pack de productos digitales con recetas gourmet para emprendedores del sector culinario.",
            price: 27.00,
            category: "Cocina",
            score: 68,
            status: "detected"
        },
        {
            name: "Te vas a Transformar",
            description: "Treinamento funcional completo com foco em saúde e bem-estar, incluindo planos alimentares e rotinas de exercícios.",
            price: 87.00,
            category: "Fitness",
            score: 81,
            status: "detected"
        },
        {
            name: "IA HEROES PRO",
            description: "Curso completo de Inteligência Artificial aplicada com exemplos práticos e projetos do mundo real. Baseado na metodologia dos 3Ps.",
            price: 297.00,
            category: "Tecnología",
            score: 95,
            status: "detected"
        },
        {
            name: "Trading Pro Max",
            description: "Sistema completo de trading con análisis técnico y señales en tiempo real para criptomonedas y forex.",
            price: 497.00,
            category: "Finanzas",
            score: 88,
            status: "detected"
        },
        {
            name: "Master TikTok Ads",
            description: "Curso especializado en publicidad en TikTok con casos de éxito y plantillas listas para usar.",
            price: 127.00,
            category: "Marketing",
            score: 76,
            status: "detected"
        },
        {
            name: "E-commerce Elite",
            description: "Método completo para crear y escalar tiendas online con productos de alta demanda.",
            price: 197.00,
            category: "E-commerce",
            score: 83,
            status: "detected"
        }
    ];

    // Función para generar un producto aleatorio
    const generateRandomProduct = () => {
        const baseProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
        const variations = [
            " 2.0", " PRO", " Advanced", " Master", " Elite", " Plus", " Max", " Premium", " Deluxe", " Ultimate"
        ];
        const randomVariation = variations[Math.floor(Math.random() * variations.length)];
        
        return {
            ...baseProduct,
            id: Date.now() + Math.random(),
            name: Math.random() > 0.7 ? baseProduct.name + randomVariation : baseProduct.name,
            price: parseFloat((baseProduct.price * (0.8 + Math.random() * 0.4)).toFixed(2)),
            score: Math.floor(60 + Math.random() * 35),
            status: 'processing',
            detected_at: new Date().toISOString()
        };
    };

    // Función para generar mensaje de actividad
    const generateActivityMessage = (product, stage) => {
        const messages = {
            detecting: [
                `🔍 Buscando productos en marketplace...`,
                `📊 Analizando categorías populares...`,
                `🎯 Enfocando en productos de alto rendimiento...`,
                `🔎 Escaneando nuevas ofertas...`
            ],
            found: [
                `🎯 Producto detectado: ${product.name}`,
                `✨ Nuevo producto encontrado: ${product.category}`,
                `📦 Oportunidad identificada: ${product.name}`,
                `💎 Producto premium localizado: ${product.name}`
            ],
            analyzing: [
                `⚡ Analizando métricas de ${product.name}...`,
                `📈 Calculando score de rendimiento...`,
                `🔍 Validando calidad del producto...`,
                `📊 Procesando datos del producto...`
            ],
            completed: [
                `✅ ${product.name} guardado exitosamente`,
                `🎉 Producto archivado en base de datos`,
                `💾 ${product.name} listo para revisión`,
                `🚀 Producto agregado al sistema`
            ]
        };
        
        const stageMessages = messages[stage] || messages.found;
        return stageMessages[Math.floor(Math.random() * stageMessages.length)];
    };

    // Efecto para simular scraping en tiempo real
    useEffect(() => {
        if (isScanning) {
            let foundProducts = [];
            let productCount = 0;
            
            // Simular descubrimiento de productos
            scanIntervalRef.current = setInterval(() => {
                if (productCount >= 8 + Math.floor(Math.random() * 7)) { // 8-14 productos
                    clearInterval(scanIntervalRef.current);
                    return;
                }
                
                const newProduct = generateRandomProduct();
                foundProducts.push(newProduct);
                productCount++;
                
                // Actualizar productos detectados
                setProducts(prev => [...prev, newProduct]);
                setTotalFound(productCount);
                setCurrentScanCount(productCount);
                
                // Agregar actividad de detección
                setRealtimeUpdates(prev => [
                    {
                        type: 'success',
                        message: generateActivityMessage(newProduct, 'found'),
                        timestamp: new Date().toISOString()
                    },
                    ...prev
                ].slice(0, 10));
                
                // Simular análisis del producto
                setTimeout(() => {
                    setProducts(prev => prev.map(p => 
                        p.id === newProduct.id 
                            ? { ...p, status: 'analyzing' }
                            : p
                    ));
                    
                    setRealtimeUpdates(prev => [
                        {
                            type: 'processing',
                            message: generateActivityMessage(newProduct, 'analyzing'),
                            timestamp: new Date().toISOString()
                        },
                        ...prev
                    ].slice(0, 10));
                }, 1500);
                
                // Simular completado del procesamiento
                setTimeout(() => {
                    setProducts(prev => prev.map(p => 
                        p.id === newProduct.id 
                            ? { ...p, status: 'completed' }
                            : p
                    ));
                    
                    setRealtimeUpdates(prev => [
                        {
                            type: 'success',
                            message: generateActivityMessage(newProduct, 'completed'),
                            timestamp: new Date().toISOString()
                        },
                        ...prev
                    ].slice(0, 10));
                }, 3000);
                
            }, 2000 + Math.random() * 2000); // Cada 2-4 segundos
            
        } else {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
            }
        }

        return () => {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
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
            case 'analyzing':
                return <Zap className="w-4 h-4 text-orange-500 animate-pulse" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Search className="w-4 h-4 text-blue-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'processing':
                return 'Detectando...';
            case 'analyzing':
                return 'Analizando...';
            case 'completed':
                return 'Completado';
            case 'error':
                return 'Error';
            default:
                return 'Nuevo';
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
                                {isScanning ? (
                                    <span className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-green-500 animate-pulse" />
                                        Scraping activo - Detectando productos...
                                    </span>
                                ) : 'Últimos productos detectados'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="flex items-center gap-2">
                            {isScanning && currentScanCount > 0 && (
                                <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium animate-pulse">
                                    +{currentScanCount} nuevos
                                </div>
                            )}
                            <div className="text-3xl font-bold text-white">{totalFound}</div>
                        </div>
                        <div className="text-sm text-zinc-400">
                            {isScanning ? 'productos esta sesión' : 'productos totales'}
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
                        {currentScanCount > 0 && (
                            <div className="text-xs text-green-400 font-medium">
                                {currentScanCount} productos detectados hasta el momento
                            </div>
                        )}
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
                        Actividad del Sistema
                        {isScanning && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        )}
                    </h4>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {realtimeUpdates.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                                {isScanning ? (
                                    <div className="space-y-2">
                                        <Database className="w-8 h-8 mx-auto text-zinc-600 animate-pulse" />
                                        <p>Iniciando sistema de detección...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Search className="w-8 h-8 mx-auto text-zinc-600" />
                                        <p>Sin actividad reciente</p>
                                        <p className="text-xs">Inicia un scraping para ver actividad</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            realtimeUpdates.map((update, index) => (
                                <div 
                                    key={`${update.timestamp}-${index}`}
                                    className={`bg-zinc-800/30 border rounded-lg p-3 animate-fade-in ${
                                        update.type === 'processing' ? 'border-orange-500/30' :
                                        update.type === 'success' ? 'border-green-500/30' :
                                        'border-zinc-700'
                                    }`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start gap-3">
                                        {update.type === 'processing' ? (
                                            <Zap className="w-4 h-4 text-orange-500 animate-pulse flex-shrink-0 mt-0.5" />
                                        ) : update.type === 'success' ? (
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm text-zinc-300 leading-relaxed">{update.message}</p>
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