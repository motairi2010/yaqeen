import { useEffect } from 'react';
import { useProductStore } from '../stores/useProductStore';

export function useProducts() {
  const {
    products,
    isLoading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    searchProducts,
    getLowStockProducts,
    getInventoryValue,
    clearError
  } = useProductStore();

  useEffect(() => {
    if (products.length === 0 && !isLoading) {
      loadProducts();
    }
  }, []);

  return {
    products,
    isLoading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    searchProducts,
    getLowStockProducts,
    getInventoryValue,
    clearError
  };
}

export function useProduct(sku) {
  const {
    currentProduct,
    isLoading,
    error,
    loadProduct,
    updateProduct,
    clearError
  } = useProductStore();

  useEffect(() => {
    if (sku && (!currentProduct || currentProduct.sku !== sku)) {
      loadProduct(sku);
    }
  }, [sku]);

  return {
    product: currentProduct,
    isLoading,
    error,
    updateProduct,
    clearError
  };
}
