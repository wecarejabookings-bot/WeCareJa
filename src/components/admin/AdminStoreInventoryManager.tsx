import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  Package, 
  Tag, 
  DollarSign, 
  Layers, 
  Eye, 
  EyeOff,
  Link,
  ShoppingBag
} from 'lucide-react';
import { StoreProduct } from '../../types';
import { 
  fetchAdminStoreProducts, 
  createStoreProduct, 
  updateStoreProduct, 
  deleteStoreProduct 
} from '../../services/storeProductsService';
import { soundFX } from '../../utils/soundEffects';

const CATEGORIES = [
  'All',
  'Equipment',
  'Supplies',
  'Kits',
  'Mobility',
  'Hygiene'
];

export const AdminStoreInventoryManager: React.FC = () => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Supplies');
  const [newPrice, setNewPrice] = useState('2500');
  const [newStock, setNewStock] = useState('10');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Inline Price Edit
  const [inlinePriceId, setInlinePriceId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminStoreProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load store products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch = !query || 
      p.name.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query)) ||
      p.category.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  // Handle Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('Product Name is required.');
      return;
    }
    const pr = parseFloat(newPrice);
    if (isNaN(pr) || pr < 0) {
      alert('Please enter a valid price in JMD.');
      return;
    }
    const st = parseInt(newStock, 10);
    if (isNaN(st) || st < 0) {
      alert('Please enter a valid stock quantity.');
      return;
    }

    setIsSubmitting(true);
    soundFX.playToggleClick();
    try {
      const created = await createStoreProduct({
        name: newName.trim(),
        description: newDescription.trim(),
        category: newCategory,
        price_jmd: pr,
        stock_qty: st,
        image_url: newImageUrl.trim() || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
        is_active: newIsActive
      });

      setProducts(prev => [created, ...prev]);
      soundFX.playSuccessPing();
      showToast(`Added "${created.name}" to store inventory!`);
      setIsAddModalOpen(false);
      // Reset form
      setNewName('');
      setNewDescription('');
      setNewCategory('Supplies');
      setNewPrice('2500');
      setNewStock('10');
      setNewImageUrl('');
      setNewIsActive(true);
    } catch (err: any) {
      alert('Failed to create product: ' + err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (p: StoreProduct) => {
    soundFX.playToggleClick();
    setEditingProduct(p);
    setEditName(p.name);
    setEditDescription(p.description || '');
    setEditCategory(p.category);
    setEditPrice(p.price_jmd.toString());
    setEditStock(p.stock_qty.toString());
    setEditImageUrl(p.image_url);
    setEditIsActive(p.is_active);
  };

  // Handle Save Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editName.trim()) return;

    const pr = parseFloat(editPrice);
    const st = parseInt(editStock, 10);
    if (isNaN(pr) || pr < 0 || isNaN(st) || st < 0) {
      alert('Please enter valid numeric values for price and stock.');
      return;
    }

    soundFX.playToggleClick();
    const updates = {
      name: editName.trim(),
      description: editDescription.trim(),
      category: editCategory,
      price_jmd: pr,
      stock_qty: st,
      image_url: editImageUrl.trim() || editingProduct.image_url,
      is_active: editIsActive
    };

    setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updates } : p));
    setEditingProduct(null);
    await updateStoreProduct(editingProduct.id, updates);
    soundFX.playSuccessPing();
    showToast(`Updated "${updates.name}" successfully!`);
  };

  // Handle Delete
  const handleDelete = async (p: StoreProduct) => {
    if (!window.confirm(`Are you sure you want to delete "${p.name}"?`)) return;
    soundFX.playCancellation();
    setProducts(prev => prev.filter(item => item.id !== p.id));
    await deleteStoreProduct(p.id);
    showToast(`Deleted "${p.name}" from inventory.`);
  };

  // Stock Increment / Decrement
  const handleAdjustStock = async (p: StoreProduct, delta: number) => {
    soundFX.playToggleClick();
    const newQty = Math.max(0, p.stock_qty + delta);
    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock_qty: newQty } : item));
    await updateStoreProduct(p.id, { stock_qty: newQty });
  };

  // Toggle Active
  const handleToggleActive = async (p: StoreProduct) => {
    soundFX.playToggleClick();
    const newActive = !p.is_active;
    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, is_active: newActive } : item));
    await updateStoreProduct(p.id, { is_active: newActive });
    showToast(`Product "${p.name}" is now ${newActive ? 'Active (Visible)' : 'Hidden'}.`);
  };

  // Inline Price Save
  const handleSaveInlinePrice = async (p: StoreProduct) => {
    const val = parseFloat(inlinePriceValue);
    if (isNaN(val) || val < 0) {
      setInlinePriceId(null);
      return;
    }
    soundFX.playToggleClick();
    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, price_jmd: val } : item));
    setInlinePriceId(null);
    await updateStoreProduct(p.id, { price_jmd: val });
    showToast(`Saved price for ${p.name}: $${val.toLocaleString()} JMD`);
  };

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold shadow-lg animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.04] p-5 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-[#1E1B4B] flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Store &amp; Inventory Control</h2>
              <p className="text-xs text-slate-400">Direct database stock control without storage buckets • URL image linking</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-white/5 cursor-pointer"
            title="Refresh database catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, description, category..."
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/30 font-black'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-white/5">
          <RefreshCw className="w-8 h-8 mx-auto text-emerald-400 animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-300">Loading store inventory...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-white/5">
          <Package className="w-10 h-10 mx-auto text-slate-500 mb-3" />
          <p className="text-sm font-bold text-slate-300">No products found matching filters</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or add a new product</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <div 
              key={p.id}
              className={`bg-white/[0.04] backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between hover:border-emerald-500/40 ${
                p.is_active ? 'border-white/10' : 'border-white/5 opacity-70 bg-white/[0.02]'
              }`}
            >
              {/* Product Image & Top Status Badge */}
              <div className="relative aspect-video bg-black/40 overflow-hidden group">
                <img 
                  src={p.image_url} 
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback image if URL fails
                    (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500');
                  }}
                />
                
                {/* Status Badges Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-black uppercase text-slate-200 border border-white/10">
                    {p.category}
                  </span>
                  {!p.is_active && (
                    <span className="px-2 py-0.5 rounded-md bg-red-500/80 backdrop-blur-md text-[10px] font-black uppercase text-white">
                      Hidden
                    </span>
                  )}
                </div>

                {/* Stock Tag on Image */}
                <div className="absolute top-2.5 right-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black backdrop-blur-md border ${
                    p.stock_qty <= 0 
                      ? 'bg-red-500/90 text-white border-red-400/30' 
                      : p.stock_qty <= 5
                      ? 'bg-amber-500/90 text-white border-amber-400/30'
                      : 'bg-emerald-500/90 text-white border-emerald-400/30'
                  }`}>
                    {p.stock_qty <= 0 ? 'Out of Stock' : `${p.stock_qty} in stock`}
                  </span>
                </div>
              </div>

              {/* Product Info Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white line-clamp-1" title={p.name}>
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1" title={p.description}>
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Price (Click to Edit Inline) & Stock Controls */}
                <div className="pt-2 border-t border-white/5 space-y-2.5">
                  {/* Inline Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">Price (JMD):</span>
                    {inlinePriceId === p.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-emerald-400 font-bold">$</span>
                        <input
                          type="number"
                          value={inlinePriceValue}
                          onChange={(e) => setInlinePriceValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveInlinePrice(p);
                            if (e.key === 'Escape') setInlinePriceId(null);
                          }}
                          autoFocus
                          className="w-20 px-1.5 py-0.5 bg-black/80 border border-emerald-400 rounded text-xs font-mono font-bold text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveInlinePrice(p)}
                          className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-400"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setInlinePriceId(null)}
                          className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setInlinePriceId(p.id);
                          setInlinePriceValue(p.price_jmd.toString());
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-mono font-black text-sm group flex items-center gap-1 cursor-pointer"
                        title="Click to edit price inline"
                      >
                        <span>${p.price_jmd.toLocaleString()} JMD</span>
                        <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    )}
                  </div>

                  {/* Stock Controls (- / +) */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">Stock Qty:</span>
                    <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(p, -1)}
                        className="w-6 h-6 rounded-lg bg-white/[0.08] hover:bg-white/[0.18] flex items-center justify-center text-slate-300 hover:text-white font-bold transition cursor-pointer text-xs"
                        title="Decrease stock"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-xs text-white">
                        {p.stock_qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(p, 1)}
                        className="w-6 h-6 rounded-lg bg-white/[0.08] hover:bg-white/[0.18] flex items-center justify-center text-slate-300 hover:text-white font-bold transition cursor-pointer text-xs"
                        title="Increase stock"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Active Toggle & Action Buttons */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    {/* Active switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p)}
                      className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-lg transition cursor-pointer ${
                        p.is_active 
                          ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20' 
                          : 'text-slate-400 bg-white/[0.03] border border-white/5'
                      }`}
                      title={p.is_active ? 'Click to hide from store' : 'Click to show in store'}
                    >
                      {p.is_active ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
                      <span>{p.is_active ? 'Active' : 'Inactive'}</span>
                    </button>

                    {/* Edit & Delete actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.15] text-slate-300 hover:text-white transition cursor-pointer"
                        title="Edit product details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121124] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Add New Store Product</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Digital Blood Pressure Monitor"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief clinical description or package details"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/60 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category Select *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1b1a32] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Kits">Kits</option>
                    <option value="Mobility">Mobility</option>
                    <option value="Hygiene">Hygiene</option>
                    <option value="PPE">PPE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Price JMD ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl font-mono text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl font-mono text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Is Active Switch</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="newIsActive"
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-black/40 border-white/20 cursor-pointer"
                    />
                    <label htmlFor="newIsActive" className="text-slate-300 font-bold cursor-pointer">
                      {newIsActive ? 'Visible in store' : 'Hidden from store'}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Image URL (Paste Link) *</label>
                <div className="relative">
                  <Link className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Direct link without storage buckets (e.g. Unsplash URL or external host)</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black shadow-lg shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121124] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Edit Store Product</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/60 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category Select *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1b1a32] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Kits">Kits</option>
                    <option value="Mobility">Mobility</option>
                    <option value="Hygiene">Hygiene</option>
                    <option value="PPE">PPE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Price JMD ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl font-mono text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl font-mono text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Is Active Switch</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="editIsActive"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-black/40 border-white/20 cursor-pointer"
                    />
                    <label htmlFor="editIsActive" className="text-slate-300 font-bold cursor-pointer">
                      {editIsActive ? 'Visible in store' : 'Hidden from store'}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Image URL (Paste Link) *</label>
                <div className="relative">
                  <Link className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black shadow-lg shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
