import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  Truck, 
  ExternalLink, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  AlertCircle,
  AlertTriangle,
  Check, 
  X,
  Edit2,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ShoppingBag,
  SlidersHorizontal,
  Image as ImageIcon
} from 'lucide-react';
import { SupplyOrder, MedicalSupplyItem } from '../../types';
import { 
  fetchSupplyOrdersFromSupabase, 
  updateSupplyOrderStatusInSupabase, 
  updateSupplyOrderInvoiceInSupabase,
  fetchMedicalSuppliesFromSupabase,
  saveMedicalSupplyToSupabase,
  deleteMedicalSupplyFromSupabase
} from '../../lib/supabase';
import { AdminStoreInventoryManager } from './AdminStoreInventoryManager';
import { soundFX } from '../../utils/soundEffects';
import { getCorrectItemImage } from '../../utils/productImages';

interface AdminSupplyOrdersManagerProps {
  isMasterAdmin?: boolean;
}

const PRESET_IMAGES = [
  { label: 'Sterile Gloves', url: '/images/gloves.jpg' },
  { label: 'Adult Diapers & Briefs', url: '/images/diapers.jpg' },
  { label: 'Sanitizing Wipes', url: '/images/wipes.jpg' },
  { label: 'First Aid Emergency Kit', url: '/images/first_aid_kit.jpg' },
  { label: 'Blood Pressure Monitor', url: '/images/bp_monitor.jpg' },
  { label: 'Pulse Oximeter & SpO2', url: '/images/pulse_oximeter.jpg' },
  { label: 'Gauze & Wound Dressing', url: '/images/gauze_dressing.jpg' },
  { label: 'Micropore Medical Tape', url: '/images/medical_tape.jpg' },
  { label: 'Antiseptic Solution', url: '/images/antiseptic_wash.jpg' },
  { label: 'Hand Sanitizer Gel', url: '/images/hand_sanitizer.jpg' },
  { label: 'IV Infusion Pack', url: '/images/iv_therapy.jpg' },
  { label: 'Catheter & Stoma Care', url: '/images/medication_management.jpg' }
];

export const AdminSupplyOrdersManager: React.FC<AdminSupplyOrdersManagerProps> = ({
  isMasterAdmin = true
}) => {
  const [subTab, setSubTab] = useState<'orders' | 'products'>('orders');
  
  // Orders State
  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Invoice URL Modal
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<SupplyOrder | null>(null);
  const [invoiceUrlInput, setInvoiceUrlInput] = useState('');
  const [isUpdatingInvoice, setIsUpdatingInvoice] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Products State
  const [products, setProducts] = useState<MedicalSupplyItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  
  // Fast Inline Product Editing State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>('');
  
  // Add Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('PPE & Infection Control');
  const [newProductPrice, setNewProductPrice] = useState('2500');
  const [newProductStock, setNewProductStock] = useState('50');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductImage, setNewProductImage] = useState('/images/gloves.jpg');

  // Full Edit Product Modal State
  const [editingFullProduct, setEditingFullProduct] = useState<MedicalSupplyItem | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormCategory, setEditFormCategory] = useState('');
  const [editFormPrice, setEditFormPrice] = useState('');
  const [editFormStock, setEditFormStock] = useState('');
  const [editFormDescription, setEditFormDescription] = useState('');
  const [editFormImage, setEditFormImage] = useState('');

  const loadData = async () => {
    setLoadingOrders(true);
    setLoadingProducts(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        fetchSupplyOrdersFromSupabase(),
        fetchMedicalSuppliesFromSupabase()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoadingOrders(false);
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    orderId: string, 
    newStatus: 'pending' | 'invoiced' | 'paid' | 'delivered' | 'cancelled'
  ) => {
    soundFX.playToggleClick();
    try {
      await updateSupplyOrderStatusInSupabase(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setStatusMessage(`Order #${orderId} marked as ${newStatus.toUpperCase()}`);
      soundFX.playSuccessPing();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert('Failed to update order status: ' + err?.message);
    }
  };

  const handleSaveInvoiceUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoiceOrder || !invoiceUrlInput.trim()) return;

    setIsUpdatingInvoice(true);
    try {
      await updateSupplyOrderInvoiceInSupabase(activeInvoiceOrder.id, invoiceUrlInput.trim());
      setOrders(prev => prev.map(o => o.id === activeInvoiceOrder.id ? { ...o, invoice_url: invoiceUrlInput.trim(), status: 'invoiced' } : o));
      soundFX.playSuccessPing();
      setStatusMessage(`Invoice attached for Order #${activeInvoiceOrder.id}`);
      setActiveInvoiceOrder(null);
      setInvoiceUrlInput('');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert('Failed to update invoice: ' + err?.message);
    } finally {
      setIsUpdatingInvoice(false);
    }
  };

  const openInvoiceModal = (order: SupplyOrder) => {
    setActiveInvoiceOrder(order);
    setInvoiceUrlInput(order.invoice_url || `https://wecareja.com/invoices/${order.id}.pdf`);
  };

  // Open Full Edit Product Modal
  const openEditProductModal = (product: MedicalSupplyItem) => {
    soundFX.playToggleClick();
    setEditingFullProduct(product);
    setEditFormName(product.name);
    setEditFormCategory(product.category);
    setEditFormPrice(product.price_jmd.toString());
    setEditFormStock((product.stock_quantity !== undefined ? product.stock_quantity : product.stock).toString());
    setEditFormDescription(product.description || '');
    setEditFormImage(product.image_url || getCorrectItemImage(product));
  };

  // Submit Full Edit Product
  const handleSaveFullProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFullProduct || !editFormName.trim()) return;

    const pr = parseFloat(editFormPrice);
    const stk = parseInt(editFormStock, 10);
    if (isNaN(pr) || pr < 0) {
      alert('Please enter a valid price in JMD');
      return;
    }
    if (isNaN(stk) || stk < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }

    soundFX.playToggleClick();
    const updatedProd: MedicalSupplyItem = {
      ...editingFullProduct,
      name: editFormName.trim(),
      category: editFormCategory,
      price_jmd: pr,
      stock: stk,
      stock_quantity: stk,
      description: editFormDescription.trim(),
      image_url: editFormImage || getCorrectItemImage(editFormName.trim()),
      is_active: stk > 0
    };

    setProducts(prev => prev.map(p => p.id === editingFullProduct.id ? updatedProd : p));
    setEditingFullProduct(null);
    await saveMedicalSupplyToSupabase(updatedProd);
    soundFX.playSuccessPing();
    setStatusMessage(`Saved changes to "${updatedProd.name}" in Supabase!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Product Inline Price Save
  const handleSavePrice = async (product: MedicalSupplyItem) => {
    const newPriceNum = parseFloat(editingPriceValue);
    if (isNaN(newPriceNum) || newPriceNum < 0) {
      alert('Please enter a valid price in JMD');
      return;
    }
    soundFX.playToggleClick();
    const updated = { ...product, price_jmd: newPriceNum };
    setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    setEditingPriceId(null);
    await saveMedicalSupplyToSupabase(updated);
    soundFX.playSuccessPing();
    setStatusMessage(`Saved price for ${product.name}: $${newPriceNum.toLocaleString()} JMD`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Product Inline Stock Save
  const handleSaveStock = async (product: MedicalSupplyItem) => {
    const newStockNum = parseInt(editingStockValue, 10);
    if (isNaN(newStockNum) || newStockNum < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }
    soundFX.playToggleClick();
    const updated = { 
      ...product, 
      stock: newStockNum, 
      stock_quantity: newStockNum,
      is_active: newStockNum > 0
    };
    setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    setEditingStockId(null);
    await saveMedicalSupplyToSupabase(updated);
    soundFX.playSuccessPing();
    setStatusMessage(`Saved stock for ${product.name}: ${newStockNum} units`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Delete Product
  const handleDeleteProduct = async (product: MedicalSupplyItem) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${product.name}" from the store catalog?`);
    if (!confirmed) return;

    soundFX.playToggleClick();
    setProducts(prev => prev.filter(p => p.id !== product.id));
    await deleteMedicalSupplyFromSupabase(product.id);
    soundFX.playSuccessPing();
    setStatusMessage(`Removed "${product.name}" from store catalog.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Add Product Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    soundFX.playToggleClick();
    const stk = Number(newProductStock) || 50;
    const newProd: MedicalSupplyItem = {
      id: `sup-${Date.now().toString().slice(-6)}`,
      name: newProductName.trim(),
      category: newProductCategory,
      price_jmd: Number(newProductPrice) || 2000,
      stock: stk,
      stock_quantity: stk,
      description: newProductDescription.trim(),
      image_url: newProductImage || getCorrectItemImage(newProductName.trim()),
      is_active: stk > 0,
      created_at: new Date().toISOString()
    };

    setProducts(prev => [newProd, ...prev]);
    await saveMedicalSupplyToSupabase(newProd);
    soundFX.playSuccessPing();
    setIsAddProductOpen(false);
    setNewProductName('');
    setNewProductDescription('');
    setStatusMessage(`Added "${newProd.name}" to store catalog!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.client_phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.client_address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter products by search, stock level, and category
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));

    const stockQty = p.stock_quantity !== undefined ? p.stock_quantity : p.stock;
    const matchesStock = 
      productStockFilter === 'all' ||
      (productStockFilter === 'in_stock' && stockQty > 5) ||
      (productStockFilter === 'low_stock' && stockQty > 0 && stockQty <= 5) ||
      (productStockFilter === 'out_of_stock' && stockQty <= 0);

    const matchesCategory = 
      productCategoryFilter === 'all' || p.category === productCategoryFilter;

    return matchesSearch && matchesStock && matchesCategory;
  });

  // Metrics
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const invoicedCount = orders.filter(o => o.status === 'invoiced').length;
  const paidCount = orders.filter(o => o.status === 'paid').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const totalSupplySales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total_jmd, 0);

  const lowStockItems = products.filter(p => {
    const s = p.stock_quantity !== undefined ? p.stock_quantity : p.stock;
    return s > 0 && s <= 5;
  });
  const outOfStockItems = products.filter(p => {
    const s = p.stock_quantity !== undefined ? p.stock_quantity : p.stock;
    return s <= 0;
  });

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-purple-950/40 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Package className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-black text-white">We Care Stores &amp; Supply Orders</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Full store inventory manager: add/edit items, manage stock quantities, track client orders, and dispatch supplies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sub-tab navigation */}
          <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setSubTab('orders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                subTab === 'orders'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>
            <button
              onClick={() => setSubTab('products')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                subTab === 'products'
                  ? 'bg-purple-600 text-white font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Catalog &amp; Stock ({products.length})</span>
              {lowStockItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                  {lowStockItems.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loadingOrders || loadingProducts}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(loadingOrders || loadingProducts) ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Low Stock Warning Banner if items <= 5 */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="block font-black text-amber-300">
                Low Stock Alert ({lowStockItems.length} item{lowStockItems.length === 1 ? '' : 's'} have 5 or fewer remaining)
              </strong>
              <span className="text-[11px] text-amber-200/80">
                {lowStockItems.map(p => `${p.name} (${p.stock_quantity ?? p.stock})`).join(', ')}. Update stock to avoid auto out-of-stock.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setSubTab('products');
              setProductStockFilter('low_stock');
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition"
          >
            Review Low Stock
          </button>
        </div>
      )}

      {/* Summary KPI Cards (Hide revenue/financial totals for non-owner!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{pendingCount}</div>
          <span className="text-[10px] text-slate-400">Needs review &amp; dispatch</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center justify-between text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Delivered</span>
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{deliveredCount}</div>
          <span className="text-[10px] text-slate-400">Completed deliveries</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Low / Out of Stock</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">
            <span className="text-amber-300">{lowStockItems.length}</span>
            <span className="text-slate-500 text-base font-normal"> / </span>
            <span className="text-red-400">{outOfStockItems.length}</span>
          </div>
          <span className="text-[10px] text-slate-400">Low (&le;5) / Out of stock</span>
        </div>

        {/* Summary KPI Cards - Pure Operational Metrics (No Financial Totals) */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Store Products</span>
            <Package className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">
            {products.length} Items
          </div>
          <span className="text-[10px] text-slate-400">Total catalog inventory</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ORDERS TABLE */}
      {/* ========================================================================= */}
      {subTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders by ID, client name, phone, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {['all', 'pending', 'invoiced', 'paid', 'delivered', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap cursor-pointer ${
                    filterStatus === st
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {loadingOrders ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Querying supply orders from Supabase...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
              <Package className="w-12 h-12 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Supply Orders in Database</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No orders match your filter criteria.'
                  : 'When clients purchase kits or supplies from the Medical Store, their orders will appear here in real time.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const statusColors: Record<string, string> = {
                  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                  invoiced: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                  paid: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                  delivered: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                  cancelled: 'bg-red-500/20 text-red-300 border-red-500/40'
                };

                const totalUnits = order.items.reduce((acc, it) => acc + (it.quantity || 1), 0);

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-3xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all space-y-4 shadow-lg"
                  >
                    {/* Header row: ID, Date, Status, Total/Units */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-black text-sm text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                          {order.id}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${statusColors[order.status] || statusColors.pending}`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {order.delivery_date && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Deliver: {order.delivery_date}</span>
                          </span>
                        )}
                      </div>

                      {/* Operational Details: WHAT & DATE */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-400 block font-bold">Package Contents</span>
                        <span className="text-sm font-black text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 font-mono">
                          {totalUnits} Item{totalUnits === 1 ? '' : 's'} Total
                        </span>
                      </div>
                    </div>

                    {/* Client info (WHO & PHONE) and Delivery address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5 p-3.5 rounded-2xl bg-black/30 border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">WHO Ordered (Client Contact)</span>
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                          <User className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>{order.client_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 font-bold">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <a href={`tel:${order.client_phone}`} className="hover:underline text-emerald-300 font-mono">{order.client_phone}</a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <a href={`mailto:${order.client_email}`} className="hover:underline">{order.client_email}</a>
                        </div>
                      </div>

                      <div className="space-y-1.5 p-3.5 rounded-2xl bg-black/30 border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">DELIVERY ADDRESS &amp; DATE</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                            Date: {order.delivery_date || 'Standard Priority'}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-100 font-medium">
                          <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{order.client_address}</span>
                        </div>
                        {order.notes && (
                          <p className="text-[11px] text-amber-200/90 italic bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl mt-1">
                            Delivery Instructions: "{order.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* WHAT Ordered: Items List with Pictures & Quantities (No Money Totals) */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">WHAT Was Ordered</span>
                      <div className="divide-y divide-white/5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={getCorrectItemImage(it)}
                                alt={it.name}
                                loading="lazy"
                                className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0 bg-slate-900"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/first_aid_kit.jpg';
                                }}
                              />
                              <div className="min-w-0">
                                <div className="text-white font-bold text-sm truncate">{it.name}</div>
                                <div className="text-xs text-slate-400">
                                  Medical Supply Dispatch Item
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-black text-xs">
                                {it.quantity}x Units
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invoice Status & Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        {order.invoice_url ? (
                          <a
                            href={order.invoice_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Invoice</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No invoice uploaded yet</span>
                        )}

                        <button
                          onClick={() => openInvoiceModal(order)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-300" />
                          <span>{order.invoice_url ? 'Replace Invoice PDF' : 'Attach Invoice'}</span>
                        </button>
                      </div>

                      {/* Status changer buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Update Status:</span>
                        {(['pending', 'invoiced', 'paid', 'delivered', 'cancelled'] as const).map(st => (
                          <button
                            key={st}
                            disabled={order.status === st}
                            onClick={() => handleUpdateStatus(order.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                              order.status === st
                                ? 'bg-white/20 text-white cursor-default opacity-50'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: PRODUCT CATALOG & INVENTORY MANAGEMENT */}
      {/* ========================================================================= */}
      {subTab === 'products' && (
        <AdminStoreInventoryManager />
      )}

      {false && subTab === 'products' && (
        <div className="space-y-4">
          {/* Header Action & Filters Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name, description, or category (gloves, diapers, wipes, BP monitor)..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Store Item</span>
              </button>
            </div>

            {/* Sub-Filters: Stock Level & Categories */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px] shrink-0">
                  <Filter className="w-3.5 h-3.5" /> Stock Filter:
                </span>
                <button
                  onClick={() => setProductStockFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    productStockFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  All Items ({products.length})
                </button>
                <button
                  onClick={() => setProductStockFilter('in_stock')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    productStockFilter === 'in_stock'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  In Stock (&gt;5)
                </button>
                <button
                  onClick={() => setProductStockFilter('low_stock')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    productStockFilter === 'low_stock'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-white/5 text-amber-300 hover:text-white'
                  }`}
                >
                  Low Stock (&le;5) ({lowStockItems.length})
                </button>
                <button
                  onClick={() => setProductStockFilter('out_of_stock')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    productStockFilter === 'out_of_stock'
                      ? 'bg-red-600 text-white'
                      : 'bg-white/5 text-red-400 hover:text-white'
                  }`}
                >
                  Out of Stock ({outOfStockItems.length})
                </button>
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-[11px]">Category:</span>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(prod => {
              const isEditingPrice = editingPriceId === prod.id;
              const isEditingStock = editingStockId === prod.id;
              const stockVal = prod.stock_quantity !== undefined ? prod.stock_quantity : prod.stock;
              const isLowStock = stockVal > 0 && stockVal <= 5;
              const isOutOfStock = stockVal <= 0;

              return (
                <div
                  key={prod.id}
                  className={`p-4 rounded-3xl bg-white/[0.03] border transition-all flex flex-col justify-between space-y-3 shadow-lg ${
                    isOutOfStock 
                      ? 'border-red-500/40 bg-red-950/10' 
                      : isLowStock 
                        ? 'border-amber-500/50 bg-amber-950/10' 
                        : 'border-white/10 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Image with alt text, badge, and actions */}
                    <div className="h-40 w-full rounded-2xl overflow-hidden relative bg-slate-900 border border-white/5">
                      <img
                        src={getCorrectItemImage(prod)}
                        alt={prod.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/first_aid_kit.jpg';
                        }}
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          {prod.category}
                        </span>
                        {/* Stock Badges */}
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-white font-black text-[10px] shadow-sm flex items-center gap-1">
                            <span>🚫 Out of Stock</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 font-black text-[10px] shadow-sm flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-slate-950" />
                            <span>Low Stock ({stockVal} left)</span>
                          </span>
                        ) : null}
                      </div>

                      {/* Top Right Action Buttons: Full Edit & Delete */}
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          onClick={() => openEditProductModal(prod)}
                          className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-purple-300 hover:text-white transition cursor-pointer border border-white/10"
                          title="Full Edit (Name, Category, Description, Image, Stock, Price)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod)}
                          className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white transition cursor-pointer"
                          title="Delete product from store"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm leading-snug">{prod.name}</h4>
                      {prod.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {prod.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Inline Pricing & Stock Editors */}
                  <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                    {/* Price Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-[11px]">Price (JMD):</span>
                      {isEditingPrice ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editingPriceValue}
                            onChange={(e) => setEditingPriceValue(e.target.value)}
                            className="w-24 px-2 py-1 rounded bg-black/60 border border-emerald-400 text-white font-mono text-xs font-bold focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePrice(prod)}
                            className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition cursor-pointer"
                            title="Save price to Supabase"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-amber-300 text-sm">
                            ${prod.price_jmd.toLocaleString()} JMD
                          </span>
                          <button
                            onClick={() => {
                              setEditingPriceId(prod.id);
                              setEditingPriceValue(prod.price_jmd.toString());
                            }}
                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Edit Price Inline"
                          >
                            <Edit2 className="w-3 h-3 text-purple-300" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stock Row with Exact Quantity Editor */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-[11px]">Stock Quantity:</span>
                      {isEditingStock ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={editingStockValue}
                            onChange={(e) => setEditingStockValue(e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-black/60 border border-blue-400 text-white font-mono text-xs font-bold focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveStock(prod)}
                            className="p-1 rounded bg-blue-500 hover:bg-blue-400 text-white font-bold transition cursor-pointer"
                            title="Save stock quantity to Supabase"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            isOutOfStock
                              ? 'bg-red-950/80 text-red-300 border border-red-500/40' 
                              : isLowStock
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {stockVal > 0 ? `${stockVal} in stock` : '0 (Out of stock)'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingStockId(prod.id);
                              setEditingStockValue(stockVal.toString());
                            }}
                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Edit Stock Quantity Inline"
                          >
                            <Edit2 className="w-3 h-3 text-blue-300" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal 1: Add New Store Item */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add New Store Item to Supabase</span>
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sterile Nitrile Examination Gloves (Box of 100)"
                  value={newProductName}
                  onChange={(e) => {
                    setNewProductName(e.target.value);
                    setNewProductImage(getCorrectItemImage(e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="PPE & Infection Control">PPE &amp; Infection Control</option>
                    <option value="Patient Care & Hygiene">Patient Care &amp; Hygiene</option>
                    <option value="Antiseptics & Sanitization">Antiseptics &amp; Sanitization</option>
                    <option value="Wound Care">Wound Care</option>
                    <option value="Diagnostic Devices">Diagnostic Devices</option>
                    <option value="Emergency & First Aid">Emergency &amp; First Aid</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Price (JMD)</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Preset Picture</label>
                  <select
                    value={newProductImage}
                    onChange={(e) => setNewProductImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                  >
                    {PRESET_IMAGES.map(img => (
                      <option key={img.url} value={img.url}>{img.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Clinical Description</label>
                <textarea
                  rows={2}
                  placeholder="Medical details, package size, materials, sterile instructions..."
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg transition"
                >
                  Save to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Full Edit Item (Name, Category, Price, Stock, Image, Description) */}
      {editingFullProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-400" />
                <span>Edit Store Item &amp; Stock</span>
              </h3>
              <button
                onClick={() => setEditingFullProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFullProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={editFormCategory}
                    onChange={(e) => setEditFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="PPE & Infection Control">PPE &amp; Infection Control</option>
                    <option value="Patient Care & Hygiene">Patient Care &amp; Hygiene</option>
                    <option value="Antiseptics & Sanitization">Antiseptics &amp; Sanitization</option>
                    <option value="Wound Care">Wound Care</option>
                    <option value="Diagnostic Devices">Diagnostic Devices</option>
                    <option value="Emergency & First Aid">Emergency &amp; First Aid</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Price (JMD)</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={editFormPrice}
                    onChange={(e) => setEditFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Stock Quantity Remaining
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormStock}
                    onChange={(e) => setEditFormStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold"
                  />
                  {Number(editFormStock) === 0 && (
                    <span className="text-[10px] text-red-400 font-bold block mt-1">
                      ⚠️ Will show "Out of Stock" &amp; disable purchase
                    </span>
                  )}
                  {Number(editFormStock) > 0 && Number(editFormStock) <= 5 && (
                    <span className="text-[10px] text-amber-400 font-bold block mt-1">
                      ⚠️ Will trigger Low Stock Warning
                    </span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Item Picture</label>
                  <select
                    value={editFormImage}
                    onChange={(e) => setEditFormImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                  >
                    {PRESET_IMAGES.map(img => (
                      <option key={img.url} value={img.url}>{img.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Clinical Description</label>
                <textarea
                  rows={2}
                  value={editFormDescription}
                  onChange={(e) => setEditFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingFullProduct(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg transition"
                >
                  Update Item in Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Attach Invoice PDF URL */}
      {activeInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Attach Order Invoice PDF</span>
              </h3>
              <button
                onClick={() => setActiveInvoiceOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Attach the official PDF invoice URL for Order <strong className="text-white font-mono">#{activeInvoiceOrder.id}</strong> ({activeInvoiceOrder.client_name}).
            </p>

            <form onSubmit={handleSaveInvoiceUrl} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Invoice PDF URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={invoiceUrlInput}
                  onChange={(e) => setInvoiceUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveInvoiceOrder(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingInvoice}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingInvoice ? 'Saving...' : 'Save & Mark Invoiced'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
