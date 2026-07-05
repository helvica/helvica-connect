import React, { useState, useMemo } from 'react';
import { ShoppingBag, Plus, Search, Tag, Image as ImageIcon, Box, TrendingUp, AlertCircle, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';
import ProductBuilder from '../components/Catalog/ProductBuilder';

export default function Catalog() {
  const { API_URL } = useAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/products`);
      return res.data;
    }
  });

  // Derived state for Dashboard Metrics
  const metrics = useMemo(() => {
    let totalValue = 0;
    let lowStock = 0;
    const categories = new Set(['All']);
    
    products.forEach(p => {
      totalValue += (parseFloat(p.price) || 0) * (parseInt(p.stock_quantity) || 0);
      if (parseInt(p.stock_quantity) <= 10) lowStock++;
      if (p.category) categories.add(p.category);
    });

    return {
      totalValue,
      lowStock,
      categories: Array.from(categories)
    };
  }, [products]);

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex flex-col md:flex-row h-full bg-neutral-50 dark:bg-black overflow-hidden relative">
      <Toaster position="top-right" />
      
      {isAdding && (
        <ProductBuilder 
          onCancel={() => setIsAdding(false)} 
          onSuccess={() => setIsAdding(false)} 
        />
      )}

      {/* Sidebar - Categories */}
      <div className="w-full md:w-64 bg-white dark:bg-[#111B21] border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 p-4 flex flex-col shrink-0 overflow-y-auto hide-scrollbar z-10">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Catalog
        </h2>
        
        <div className="mb-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search products or SKU..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field w-full pl-9 bg-neutral-50 dark:bg-black text-sm py-2"
          />
        </div>

        <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3 mt-4 flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" /> Categories</h3>
        <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {metrics.categories.map(cat => {
            const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group whitespace-nowrap md:whitespace-normal",
                  activeCategory === cat 
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" 
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                )}
              >
                <span className="truncate">{cat}</span>
                <span className={clsx(
                  "text-xs px-2 py-0.5 rounded-full ml-2",
                  activeCategory === cat ? "bg-indigo-100 dark:bg-indigo-900/50" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700"
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Products</h1>
              <p className="text-sm text-neutral-500 mt-1">Manage inventory, pricing, and details.</p>
            </div>
            <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center shadow-lg shadow-indigo-500/20 whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </button>
          </div>

          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card p-5 bg-white dark:bg-[#111B21] border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                 <Box className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Products</p>
                 <h4 className="text-2xl font-bold text-neutral-900 dark:text-white">{products.length}</h4>
               </div>
            </div>
            <div className="card p-5 bg-white dark:bg-[#111B21] border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                 <TrendingUp className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Inventory Value</p>
                 <h4 className="text-2xl font-bold text-neutral-900 dark:text-white">${metrics.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h4>
               </div>
            </div>
            <div className="card p-5 bg-white dark:bg-[#111B21] border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                 <AlertCircle className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Low Stock Alerts</p>
                 <h4 className="text-2xl font-bold text-neutral-900 dark:text-white">{metrics.lowStock}</h4>
               </div>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#111B21] rounded-2xl border border-neutral-200 dark:border-neutral-800 border-dashed">
              <ShoppingBag className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No products found</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">You don't have any products in this category matching your search.</p>
              {!searchQuery && activeCategory === 'All' && (
                <button onClick={() => setIsAdding(true)} className="btn-primary">Add Your First Product</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => {
                const stock = parseInt(product.stock_quantity) || 0;
                const isOutOfStock = stock <= 0;
                
                return (
                  <div key={product.id} className="bg-white dark:bg-[#111B21] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col relative">
                    
                    <div className="h-56 w-full bg-neutral-100 dark:bg-[#202C33] relative overflow-hidden shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className={clsx("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", isOutOfStock && "grayscale opacity-80")}
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-[#202C33]" style={{ display: product.image_url ? 'none' : 'flex' }}>
                         <ImageIcon className="w-8 h-8 opacity-50" />
                      </div>
                      
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/40 dark:bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                          <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-lg">Out of Stock</span>
                        </div>
                      )}
                      
                      {product.category && (
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-md text-neutral-900 dark:text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase shadow-sm z-20">
                          {product.category}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className="font-bold text-neutral-900 dark:text-white line-clamp-2 leading-tight">{product.name}</h3>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg shrink-0">${parseFloat(product.price).toFixed(2)}</span>
                      </div>
                      
                      <div className="text-xs font-mono text-neutral-400 dark:text-neutral-500 mb-2">
                        SKU: {product.sku || `PRD-${product.id}`}
                      </div>
                      
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-auto">
                        {product.description || 'No description provided.'}
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                         <div className="flex items-center gap-1.5">
                           <div className={clsx("w-2 h-2 rounded-full", stock > 10 ? "bg-emerald-500" : stock > 0 ? "bg-amber-500" : "bg-rose-500")}></div>
                           <span className={clsx("text-xs font-semibold", stock > 10 ? "text-emerald-600 dark:text-emerald-400" : stock > 0 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400")}>
                             {stock} in stock
                           </span>
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
