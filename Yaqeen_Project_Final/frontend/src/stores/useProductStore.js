import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as productService from '../services/productService';

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      currentProduct: null,
      isLoading: false,
      error: null,
      companyId: 'default',

      setCompanyId: (companyId) => set({ companyId }),

      loadProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const products = await productService.getAllProducts(get().companyId);
          set({ products, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      loadProduct: async (sku) => {
        set({ isLoading: true, error: null });
        try {
          const product = await productService.getProductBySku(sku, get().companyId);
          set({ currentProduct: product, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      createProduct: async (product) => {
        set({ isLoading: true, error: null });
        try {
          const newProduct = await productService.createProduct(product, get().companyId);
          set(state => ({
            products: [...state.products, newProduct],
            currentProduct: newProduct,
            isLoading: false
          }));
          return newProduct;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateProduct: async (sku, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedProduct = await productService.updateProduct(sku, updates, get().companyId);
          set(state => ({
            products: state.products.map(p => p.sku === sku ? updatedProduct : p),
            currentProduct: state.currentProduct?.sku === sku ? updatedProduct : state.currentProduct,
            isLoading: false
          }));
          return updatedProduct;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteProduct: async (sku) => {
        set({ isLoading: true, error: null });
        try {
          await productService.deleteProduct(sku, get().companyId);
          set(state => ({
            products: state.products.filter(p => p.sku !== sku),
            currentProduct: state.currentProduct?.sku === sku ? null : state.currentProduct,
            isLoading: false
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateStock: async (sku, quantityChange) => {
        set({ isLoading: true, error: null });
        try {
          const updatedProduct = await productService.updateStock(sku, quantityChange, get().companyId);
          set(state => ({
            products: state.products.map(p => p.sku === sku ? updatedProduct : p),
            isLoading: false
          }));
          return updatedProduct;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      searchProducts: async (query) => {
        set({ isLoading: true, error: null });
        try {
          const results = await productService.searchProducts(query, get().companyId);
          set({ products: results, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      getLowStockProducts: (threshold = 10) => {
        const { products } = get();
        return products.filter(p => (p.quantity || 0) <= threshold);
      },

      getInventoryValue: () => {
        const { products } = get();
        return products.reduce((sum, p) => sum + (p.cost || 0) * (p.quantity || 0), 0);
      },

      clearError: () => set({ error: null }),

      reset: () => set({
        products: [],
        currentProduct: null,
        isLoading: false,
        error: null
      })
    }),
    {
      name: 'yaqeen-product-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ companyId: state.companyId })
    }
  )
);
