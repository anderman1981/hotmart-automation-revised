import API_BASE from '../api';
// Modified delete function without Alert
const handleDeleteProduct = async (product) => {
    console.log(`🗑️ Deleting product: ${product.name} (${product.id})`);
    
    try {
        const response = await fetch(API_BASE + `/api/products/${product.id}`, {
                method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Remove from selected products if it was selected
            setSelectedProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(product.id);
                localStorage.setItem('selectedProducts', JSON.stringify([...newSet]));
                return newSet;
            });
            
            // Remove from products list
            setProducts(prev => prev.filter(p => p.id !== product.id));
            
            toast.success(`"${product.name}" eliminado exitosamente`);
            console.log('✅ Product deleted successfully:', result);
        } else {
            const error = await response.json();
            toast.error(`Error al eliminar "${product.name}": ${error.error || 'Error desconocido'}`);
            console.error('❌ Delete failed:', error);
        }
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        toast.error(`Error al eliminar "${product.name}": ${error.message}`);
    }
};

export default handleDeleteProduct;