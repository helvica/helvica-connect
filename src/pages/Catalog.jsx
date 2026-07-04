import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Tag, Image as ImageIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function Catalog() {
  const { API_URL } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/products`);
      return res.data;
    }
  });

  // Add Product Mutation
  const addMutation = useMutation({
    mutationFn: async (productData) => {
      const res = await axios.post(`${API_URL}/products`, productData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product added successfully!');
      setIsAdding(false);
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to add product');
    }
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error('Name and Price are required');
      return;
    }
    addMutation.mutate({
      name,
      description,
      price: parseFloat(price),
      image_url: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
      stock_status: 'In Stock'
    });
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-neutral-50 dark:bg-black">
      <Toaster position="top-right" />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Product Catalog
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Manage your e-commerce inventory and share products via WhatsApp.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 card p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Add New Product</h2>
          <form onSubmit={handleAdd} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Product Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field w-full" placeholder="e.g. Wireless Headphones" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Price ($) *</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="input-field w-full" placeholder="99.99" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="input-field w-full" placeholder="Product details..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Image URL</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="input-field w-full" placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg dark:bg-neutral-800 dark:text-neutral-300">Cancel</button>
              <button type="submit" disabled={addMutation.isPending} className="btn-primary">{addMutation.isPending ? 'Saving...' : 'Save Product'}</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-neutral-500">Loading catalog...</p>
      ) : products.length === 0 && !isAdding ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 border-dashed">
          <ShoppingBag className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No products found</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">Your catalog is empty. Add a product to start selling on WhatsApp.</p>
          <button onClick={() => setIsAdding(true)} className="btn-primary">Add Your First Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-48 w-full bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-neutral-400"><ImageIcon className="w-8 h-8" /></div>
                )}
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase shadow-sm">
                  {product.stock_status}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-neutral-900 dark:text-white truncate pr-2">{product.name}</h3>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">${product.price}</span>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{product.description || 'No description provided.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
