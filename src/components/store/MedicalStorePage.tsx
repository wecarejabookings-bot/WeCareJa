import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Package, 
  ArrowLeft, 
  CheckCircle2, 
  Truck, 
  Search, 
  Filter, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  User, 
  Mail, 
  FileText,
  CreditCard,
  X
} from 'lucide-react';
import { MedicalSupplyItem, SupplyOrderItem, UserAccount } from '../../types';
import { fetchMedicalSuppliesFromSupabase, createSupplyOrderRecord } from '../../lib/supabase';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface MedicalStorePageProps {
  currentUser?: UserAccount | null;
  onBackToPortal: () => void;
  onOpenSignIn?: () => void;
}

export const MedicalStorePage: React.FC<MedicalStorePageProps> = ({
  currentUser,
  onBackToPortal,
  onOpenSignIn
}) => {
  const [supplies, setSupplies] = useState<MedicalSupplyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Cart state: map of supplyId -> { item, quantity }
  const [cart, setCart] = useState<Record<string, { item: MedicalSupplyItem; quantity: number }>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Checkout Form
  const [clientName, setClientName] = useState(currentUser?.name || currentUser?.full_name || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [clientAddress, setClientAddress] = useState(currentUser?.address || '');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Sync user info if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (!clientName) setClientName(currentUser.name || currentUser.full_name || '');
      if (!clientEmail) setClientEmail(currentUser.email || '');
      if (!clientPhone) setClientPhone(currentUser.phone || '');
      if (!clientAddress) setClientAddress(currentUser.address || '');
    }
  }, [currentUser]);

  // Load supplies from Supabase
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const items = await fetchMedicalSuppliesFromSupabase();
        setSupplies(items);
      } catch (err) {
        console.error('Failed to load supplies:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter supplies
  const categories = ['all', ...Array.from(new Set(supplies.map(s => s.category)))];

  const filteredSupplies = supplies.filter(s => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (item: MedicalSupplyItem) => {
    soundFX.playToggleClick();
    setCart(prev => {
      const existing = prev[item.id];
      const newQty = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [item.id]: { item, quantity: newQty }
      };
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: { ...existing, quantity: newQty }
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    soundFX.playCancellation();
    setCart(prev => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const cartItems = Object.values(cart);
  const totalItemCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalJMD = cartItems.reduce((acc, curr) => acc + curr.item.price_jmd * curr.quantity, 0);

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim() || !clientAddress.trim()) {
      setOrderError('Please complete all delivery contact details.');
      soundFX.playWarningSound();
      return;
    }

    if (cartItems.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedItems: SupplyOrderItem[] = cartItems.map(c => ({
        supply_id: c.item.id,
        name: c.item.name,
        price_jmd: c.item.price_jmd,
        quantity: c.quantity
      }));

      const created = await createSupplyOrderRecord({
        client_id: currentUser?.id,
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim(),
        client_address: clientAddress.trim(),
        items: formattedItems,
        total_jmd: totalJMD,
        notes: orderNotes.trim()
      });

      soundFX.playSuccessPing();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setConfirmedOrderId(created.id);
      setCart({});
      setIsCheckingOut(false);
      setIsCartOpen(false);
    } catch (err: any) {
      setOrderError(err?.message || 'Failed to place supply order. Please try again.');
      soundFX.playWarningSound();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 text-white">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-[#0F0B1E]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPortal}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </button>
            <div className="hidden sm:block h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Package className="w-4 h-4" />
              </span>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                We Care Medical Supplies
              </h1>
            </div>
          </div>

          {/* Right Action: Cart button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {totalItemCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-950 text-white text-[10px] font-mono font-bold">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-purple-950/50 to-slate-900 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Express Delivery in Kingston &amp; St. Andrew</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Hospital-Grade Medical Supplies &amp; Home Kits
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Order essential clinical disposables, sterile wound dressings, examination gloves, diagnostic BP cuffs, and first aid supplies directly to your doorstep.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {cat === 'all' ? 'All Supplies' : cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search supplies or equipment..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Supplies Product Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading medical supplies from Supabase...</p>
          </div>
        ) : filteredSupplies.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
            <Package className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Supplies Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No items match your search. Try another query or select "All Supplies".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredSupplies.map(item => {
              const inCartQty = cart[item.id]?.quantity || 0;
              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col overflow-hidden group shadow-lg"
                >
                  <div className="h-44 w-full bg-slate-900/80 relative overflow-hidden">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&q=80&w=400'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        {item.category}
                      </span>
                    </div>
                    {item.stock > 0 ? (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
                          {item.stock} in stock
                        </span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition leading-snug">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Price</span>
                        <span className="text-base font-black text-amber-300 font-mono">
                          ${item.price_jmd.toLocaleString()} <span className="text-[10px] font-sans text-slate-300 font-normal">JMD</span>
                        </span>
                      </div>

                      {inCartQty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/20 p-1 rounded-xl border border-emerald-500/40">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-white">
                            {inCartQty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          disabled={item.stock <= 0}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar if items exist */}
      {totalItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black shadow-2xl shadow-emerald-950/80 border border-emerald-300 flex items-center justify-between transition cursor-pointer animate-bounce-subtle"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center font-mono text-xs font-black">
                {totalItemCount}
              </div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-950">View Supply Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-black text-slate-950">
                ${totalJMD.toLocaleString()} JMD
              </span>
              <ShoppingBag className="w-4 h-4 text-slate-950" />
            </div>
          </button>
        </div>
      )}

      {/* Cart & Checkout Slide-Over Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#140E2A] border-l border-white/10 h-full flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#140E2A]/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Your Medical Supplies Cart</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-mono">
                  {totalItemCount}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckingOut(false);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 flex-1 space-y-4">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-white">Your cart is empty</p>
                  <p className="text-xs text-slate-400">Add medical supplies or first aid kits to proceed.</p>
                </div>
              ) : !isCheckingOut ? (
                /* Item list review view */
                <div className="space-y-3">
                  <div className="space-y-2.5">
                    {cartItems.map(({ item, quantity }) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3"
                      >
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&q=80&w=400'}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                          <span className="text-[11px] font-mono text-amber-300">
                            ${item.price_jmd.toLocaleString()} JMD
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-1 p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Supplies Subtotal:</span>
                      <span className="font-mono font-bold text-white">${totalJMD.toLocaleString()} JMD</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Local Delivery (Kingston &amp; St. Andrew):</span>
                      <span className="text-emerald-400 font-bold">Standard Dispatch</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black text-white">
                      <span>Total:</span>
                      <span className="text-amber-300 font-mono">${totalJMD.toLocaleString()} JMD</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Checkout Form */
                <form id="store-checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Orders are saved directly to Supabase and dispatched for home delivery.</span>
                  </div>

                  {orderError && (
                    <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Marjorie Campbell"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-300 block mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="client@gmail.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-300 block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="(876) 555-0192"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Delivery Address</label>
                      <textarea
                        required
                        rows={2}
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        placeholder="Street address, apartment/gate, Kingston / St Andrew"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Special Instructions / Gate Code (Optional)</label>
                      <input
                        type="text"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="e.g. Leave with security guard, gate code 2490"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Drawer Footer Actions */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-white/10 bg-[#140E2A] space-y-3 sticky bottom-0">
                {!isCheckingOut ? (
                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Checkout (${totalJMD.toLocaleString()} JMD)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      form="store-checkout-form"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Submitting to Supabase...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>Confirm &amp; Place Order (${totalJMD.toLocaleString()} JMD)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Confirmed Modal */}
      {confirmedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-[#1E1538] to-[#120B24] border-2 border-emerald-500/50 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black">
                Supabase Order Created
              </span>
              <h3 className="text-xl font-black text-white">Order Confirmed!</h3>
              <p className="text-xs text-slate-300">
                Your supply order reference number is:
              </p>
              <div className="py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-base font-mono font-black text-amber-300">
                {confirmedOrderId}
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              We Care dispatch has received your supply order with status <strong className="text-amber-300">pending</strong>. An invoice will be generated by our administrator and coordinated via WhatsApp/Phone.
            </p>

            <button
              onClick={() => setConfirmedOrderId(null)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
