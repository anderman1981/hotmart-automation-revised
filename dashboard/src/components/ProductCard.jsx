import React, { useState } from 'react';
import { 
  TrendingUp, 
  Star, 
  Users, 
  DollarSign, 
  Clock, 
  Award, 
  BookOpen, 
  Target,
  Zap,
  Heart,
  ShoppingCart,
  Eye,
  BarChart3,
  Flame,
  CheckCircle
} from 'lucide-react';

const ProductCard = ({ product, onClick, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Iconos de categorías
  const getCategoryIcon = () => {
    const icons = {
      'Business': <TrendingUp className="w-5 h-5" />,
      'Beauty': <Heart className="w-5 h-5" />,
      'Marketing': <Target className="w-5 h-5" />,
      'Culinary': <BookOpen className="w-5 h-5" />,
      'Health & Fitness': <Zap className="w-5 h-5" />,
      'AI & Tech': <BarChart3 className="w-5 h-5" />,
      'General': <BookOpen className="w-5 h-5" />
    };
    return icons[product.niche] || icons['General'];
  };

  // Color de categoría
  const getCategoryColor = () => {
    const colors = {
      'Business': 'from-blue-500 to-cyan-500',
      'Beauty': 'from-pink-500 to-rose-500',
      'Marketing': 'from-purple-500 to-indigo-500',
      'Culinary': 'from-orange-500 to-yellow-500',
      'Health & Fitness': 'from-green-500 to-emerald-500',
      'AI & Tech': 'from-violet-500 to-purple-500',
      'General': 'from-gray-500 to-slate-500'
    };
    return colors[product.niche] || colors['General'];
  };

  // Formatear precio
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Calcular score visual
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Estado del producto
  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { color: 'bg-green-500/20 text-green-300 border-green-500/30', text: 'Activo' },
      'testing': { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'Testing' },
      'cold': { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', text: 'Inactivo' },
      'pending': { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', text: 'Pendiente' }
    };
    return statusConfig[status] || statusConfig['pending'];
  };

  // Manejar clic en la tarjeta con error handling
  const handleCardClick = (e) => {
    // Evitar conflicto con botones dentro de la tarjeta
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    
    try {
      if (onClick && typeof onClick === 'function') {
        onClick(product);
      } else {
        // Si no hay onClick, abrir la página del producto
        const salesUrl = product.url_sales_page || product.sales_page_url || `https://pay.hotmart.com/${product.hotmart_id}`;
        if (salesUrl && salesUrl !== 'https://pay.hotmart.com/undefined') {
          window.open(salesUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error handling card click:', error);
    }
  };

  const statusInfo = getStatusBadge(product.status);

  // Verificar estado de afiliado
  const getAffiliateStatus = () => {
    if (product.affiliate_status === 'active') {
      return {
        show: true,
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        text: 'Afiliado ✅',
        icon: <CheckCircle className="w-3 h-3" />
      };
    } else if (product.affiliate_status === 'pending') {
      return {
        show: true,
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        text: 'Afiliado ⏳',
        icon: <Clock className="w-3 h-3" />
      };
    } else if (product.has_affiliate_link || product.affiliate_url) {
      return {
        show: true,
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        text: 'Afiliado 🔗',
        icon: <Eye className="w-3 h-3" />
      };
    }
    return { show: false };
  };

  const affiliateStatus = getAffiliateStatus();

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-500 transform
        ${isHovered ? 'scale-105 -translate-y-2' : 'scale-100 translate-y-0'}
        ${isSelected ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Fondo glassmorphism */}
      <div className="
        relative bg-white/10 backdrop-blur-md rounded-2xl
        border border-white/20 shadow-2xl overflow-hidden
        hover:border-white/30 transition-all duration-300
      ">
        {/* Gradiente superior */}
        <div className={`
          h-2 bg-gradient-to-r ${getCategoryColor()}
          opacity-80 group-hover:opacity-100 transition-opacity duration-300
        `}></div>

        {/* Header con icono de categoría */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            {/* Icono de categoría */}
            <div className={`
              p-3 rounded-xl bg-gradient-to-br ${getCategoryColor()}
              text-white shadow-lg transform transition-all duration-300
              ${isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}
            `}>
              {getCategoryIcon()}
            </div>

            <div className="flex flex-col gap-1">
              {/* Badge de estado */}
              <div className={`
                px-3 py-1 rounded-full text-xs font-medium border
                ${statusInfo.color}
              `}>
                {statusInfo.text}
              </div>
              
              {/* Badge de afiliado */}
              {affiliateStatus.show && (
                <div className={`
                  px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1
                  ${affiliateStatus.color}
                `}>
                  {affiliateStatus.icon}
                  {affiliateStatus.text}
                </div>
              )}
            </div>
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-orange-300 transition-colors duration-300">
            {product.name || 'Sin nombre'}
          </h3>

          {/* Descripción */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
            {product.description || 'Sin descripción'}
          </p>

          {/* Métricas principales */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Rating */}
            <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div>
                  <p className="text-white font-semibold">{product.rating || '4.5'}</p>
                  <p className="text-gray-400 text-xs">Rating</p>
                </div>
              </div>
            </div>

            {/* Estudiantes */}
            <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-white font-semibold">
                    {product.students ? `${(product.students / 1000).toFixed(1)}k` : '1.2k'}
                  </p>
                  <p className="text-gray-400 text-xs">Estudiantes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="space-y-2 mb-4">
            {/* Precio y comisión */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Precio:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{formatPrice(product.price)}</span>
                {product.commission_rate && (
                  <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full">
                    {product.commission_rate}% com.
                  </span>
                )}
              </div>
            </div>

            {/* Score de rendimiento */}
            {product.performance_score && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Score:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        product.performance_score >= 80 ? 'bg-green-400' :
                        product.performance_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${product.performance_score}%` }}
                    ></div>
                  </div>
                  <span className={`font-bold ${getScoreColor(product.performance_score)}`}>
                    {Math.round(product.performance_score)}%
                  </span>
                </div>
              </div>
            )}

            {/* Duración */}
            {product.duration && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Duración:</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-white text-sm">{product.duration}</span>
                </div>
              </div>
            )}

            {/* Tasa de conversión */}
            {product.conversion_rate && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Conversión:</span>
                <span className="text-orange-400 font-bold">{product.conversion_rate}%</span>
              </div>
            )}

            {/* Nivel de dificultad */}
            {product.level && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Nivel:</span>
                <span className="text-purple-400 text-sm capitalize">{product.level}</span>
              </div>
            )}
          </div>

          {/* Indicadores especiales */}
          <div className="flex gap-2 mb-4">
            {product.popular && (
              <div className="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                <Flame className="w-3 h-3" />
                Popular
              </div>
            )}
            {product.trending && (
              <div className="flex items-center gap-1 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                Trending
              </div>
            )}
            {product.certificate && (
              <div className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                <Award className="w-3 h-3" />
                Certificado
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
              className={`
                flex-1 py-2 px-4 rounded-lg font-medium text-sm
                transition-all duration-300 transform
                bg-gradient-to-r ${getCategoryColor()}
                text-white hover:shadow-lg hover:scale-105
                flex items-center justify-center gap-2
              `}
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    const salesUrl = product.url_sales_page || product.sales_page_url || `https://pay.hotmart.com/${product.hotmart_id}`;
                    if (salesUrl && salesUrl !== 'https://pay.hotmart.com/undefined') {
                      window.open(salesUrl, '_blank');
                    }
                  } catch (error) {
                    console.error('Error opening product URL:', error);
                  }
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                Ver Producto
              </button>
              
              {product.selected_for_tracking && (
                <button
                  className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-300"
                  title="Seleccionado para seguimiento"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Botón de enlace de afiliado */}
            {product.affiliate_status === 'active' ? (
              <button
                className="
                  w-full py-2 px-4 rounded-lg font-medium text-sm
                  transition-all duration-300 transform
                  bg-gradient-to-r from-green-500 to-emerald-500
                  text-white hover:shadow-lg hover:scale-105
                  flex items-center justify-center gap-2
                "
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    const affiliateUrl = product.affiliate_url || 
                                       (product.url_sales_page ? `${product.url_sales_page}?ref=W949655431L` : 
                                        `https://pay.hotmart.com/${product.hotmart_id}?ref=W949655431L`);
                    if (affiliateUrl && affiliateUrl !== 'https://pay.hotmart.com/undefined?ref=W949655431L') {
                      window.open(affiliateUrl, '_blank');
                    }
                  } catch (error) {
                    console.error('Error opening affiliate URL:', error);
                  }
                }}
              >
                <DollarSign className="w-4 h-4" />
                Enlace de Afiliado ✅
              </button>
            ) : product.affiliate_status === 'pending' || product.has_affiliate_link ? (
              <button
                className="
                  w-full py-2 px-4 rounded-lg font-medium text-sm
                  transition-all duration-300 transform
                  bg-gradient-to-r from-yellow-500 to-orange-500
                  text-white hover:shadow-lg hover:scale-105
                  flex items-center justify-center gap-2
                "
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    // Subscribe to affiliate program
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/affiliate/subscribe`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        productId: product.id, 
                        hotmartId: product.hotmart_id 
                      })
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      window.open(data.affiliateRegistrationUrl, '_blank');
                    } else {
                      throw new Error('Error al suscribirse al programa de afiliados');
                    }
                  } catch (error) {
                    console.error('Error subscribing to affiliate program:', error);
                    // Fallback: open Hotmart directly
                    const salesUrl = product.url_sales_page || `https://pay.hotmart.com/${product.hotmart_id}`;
                    window.open(salesUrl, '_blank');
                  }
                }}
              >
                <DollarSign className="w-4 h-4" />
                Suscribirse como Afiliado
              </button>
            ) : null}
          </div>
        </div>

        {/* Efecto de brillo en hover */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0
          transform -skew-x-12 -translate-x-full group-hover:translate-x-full
          transition-transform duration-1000 ease-out pointer-events-none
        `}></div>
      </div>

      {/* Efecto de sombra externa */}
        <div className={`
          absolute -inset-1 bg-gradient-to-r ${getCategoryColor()}
          opacity-0 group-hover:opacity-20 blur-xl rounded-2xl
          transition-opacity duration-300 -z-10
        `}></div>
    </div>
  );
};

export default ProductCard;