import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { X, Save, Image as ImageIcon, Box, Tag, DollarSign, List, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ProductBuilder({ onCancel, onSuccess }) {
  const { API_URL } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState(10);
  
  // Basic SKU generator
  useEffect(() => {
    if (name && !sku) {
      const generated = name.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      setSku(generated);
    }
  }, [name]);

  const addMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        description,
        price: parseFloat(price) || 0,
        image_url: imageUrl,
        stock_status: stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
        sku,
        category: category || 'Uncategorized',
        stock_quantity: parseInt(stockQuantity) || 0,
        variants: [] // Future advanced feature
      };
      const res = await axios.post(`${API_URL}/products`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product added successfully!');
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to add product');
    }
  });

  const handleSave = () => {
    if (!name || !price) {
      toast.error('Name and Price are required.');
      return;
    }
    addMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111B21] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Add Product
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Create a new item in your enterprise catalog.</p>
          </div>
          <button onClick={onCancel} className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar flex flex-col md:flex-row gap-8">
          
          {/* Form Side */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* General */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <List className="w-4 h-4 text-neutral-400" /> General Info
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Product Name <span className="text-rose-500">*</span></label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wireless Noise-Cancelling Headphones" className="input-field w-full font-medium" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="High-quality audio experience..." className="input-field w-full resize-none leading-relaxed"></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Electronics, Apparel..." className="input-field w-full" />
              </div>
            </div>

            {/* Inventory & Pricing */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <Tag className="w-4 h-4 text-neutral-400" /> Pricing & Inventory
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Price <span className="text-rose-500">*</span>
                  </label>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="input-field w-full font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5" /> SKU (Stock Keeping Unit)
                  </label>
                  <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="WH-1234" className="input-field w-full font-mono uppercase" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Stock Quantity</label>
                <input type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} className="input-field w-full" />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <ImageIcon className="w-4 h-4 text-neutral-400" /> Media
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Image URL</label>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" className="input-field w-full font-mono text-sm" />
                <p className="text-xs text-neutral-500 mt-2">Provide a public URL to the product image.</p>
              </div>
            </div>

          </div>

          {/* Live Preview Side */}
          <div className="w-full md:w-[320px] shrink-0 flex flex-col">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              Live Preview
            </h3>
            
            <div className="bg-white dark:bg-[#182229] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-lg sticky top-0">
              {/* Image Preview */}
              <div className="h-56 w-full bg-neutral-100 dark:bg-[#202C33] flex items-center justify-center relative overflow-hidden group">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-[#202C33]" style={{ display: imageUrl ? 'none' : 'flex' }}>
                   <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                   <span className="text-xs font-medium">Image Preview</span>
                </div>
                
                {stockQuantity <= 0 && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-lg">Out of Stock</div>
                  </div>
                )}
              </div>
              
              {/* Content Preview */}
              <div className="p-5 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                   <h4 className="font-bold text-neutral-900 dark:text-white leading-tight line-clamp-2">{name || 'Product Name'}</h4>
                   <div className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0 text-lg">${parseFloat(price || 0).toFixed(2)}</div>
                </div>
                
                <div className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                  SKU: {sku || '---'}
                </div>
                
                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                  {description || 'Product description will appear here...'}
                </p>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="bg-neutral-100 dark:bg-[#2A3942] px-2 py-1 rounded text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    {category || 'Uncategorized'}
                  </div>
                  <div className={clsx("text-xs font-bold", stockQuantity > 10 ? "text-emerald-500" : stockQuantity > 0 ? "text-amber-500" : "text-rose-500")}>
                    {stockQuantity > 0 ? `${stockQuantity} in stock` : '0 in stock'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0B141A] flex justify-end gap-3 shrink-0">
          <button onClick={onCancel} className="btn-secondary bg-white dark:bg-neutral-800 px-6">
            Cancel
          </button>
          <button onClick={handleSave} disabled={addMutation.isPending || !name || !price} className="btn-primary flex items-center px-8 shadow-lg shadow-indigo-500/20">
            {addMutation.isPending ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Product</>}
          </button>
        </div>
        
      </div>
    </div>
  );
}
