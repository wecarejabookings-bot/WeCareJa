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
  XCircle, 
  ExternalLink, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Upload, 
  AlertCircle,
  Eye,
  Check,
  X
} from 'lucide-react';
import { SupplyOrder } from '../../types';
import { 
  fetchSupplyOrdersFromSupabase, 
  updateSupplyOrderStatusInSupabase, 
  updateSupplyOrderInvoiceInSupabase 
} from '../../lib/supabase';
import { soundFX } from '../../utils/soundEffects';

interface AdminSupplyOrdersManagerProps {
  isMasterAdmin?: boolean;
}

export const AdminSupplyOrdersManager: React.FC<AdminSupplyOrdersManagerProps> = ({
  isMasterAdmin = true
}) => {
  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Invoice URL Modal
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<SupplyOrder | null>(null);
  const [invoiceUrlInput, setInvoiceUrlInput] = useState('');
  const [isUpdatingInvoice, setIsUpdatingInvoice] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchSupplyOrdersFromSupabase();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load supply orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
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
      const updated = await updateSupplyOrderInvoiceInSupabase(activeInvoiceOrder.id, invoiceUrlInput.trim());
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

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const invoicedCount = orders.filter(o => o.status === 'invoiced').length;
  const paidCount = orders.filter(o => o.status === 'paid').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const totalRevenueJMD = orders
    .filter(o => o.status === 'paid' || o.status === 'delivered')
    .reduce((acc, curr) => acc + curr.total_jmd, 0);

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-purple-950/40 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Package className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-black text-white">Medical Supply Orders Management</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Review client homecare supply requests, dispatch orders, update status, and manage invoices stored in Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh from Supabase</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Pending Action</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{pendingCount}</div>
          <span className="text-[10px] text-slate-400">Needs review &amp; invoicing</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Invoiced</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{invoicedCount}</div>
          <span className="text-[10px] text-slate-400">Awaiting client payment</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Paid &amp; Delivered</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{paidCount + deliveredCount}</div>
          <span className="text-[10px] text-slate-400">{deliveredCount} fulfilled</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center justify-between text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Total Supply Sales</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
            ${totalRevenueJMD.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">JMD revenue volume</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {['all', 'pending', 'invoiced', 'paid', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                filterStatus === status
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, ID, address..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Querying supply orders from Supabase...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Supply Orders in Database</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {orders.length === 0
              ? 'When clients purchase kits or supplies from the Medical Store, their orders will appear here in real time.'
              : 'No orders match your selected filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusColors = {
              pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              invoiced: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
              paid: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
              delivered: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
              cancelled: 'bg-red-500/20 text-red-300 border-red-500/40'
            };

            return (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all space-y-4"
              >
                {/* Header row: ID, Date, Status, Total */}
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
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Total Amount</span>
                      <span className="text-lg font-black font-mono text-amber-300">
                        ${order.total_jmd.toLocaleString()} <span className="text-xs text-slate-300 font-normal">JMD</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client info & Delivery address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 p-3 rounded-2xl bg-black/30 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Client Contact</span>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>{order.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <a href={`tel:${order.client_phone}`} className="hover:underline">{order.client_phone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <a href={`mailto:${order.client_email}`} className="hover:underline">{order.client_email}</a>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-black/30 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Destination</span>
                    <div className="flex items-start gap-2 text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{order.client_address}</span>
                    </div>
                    {order.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-white/5 p-1.5 rounded-lg mt-1">
                        Notes: "{order.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Ordered Items Table / List */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Items in Order</span>
                  <div className="divide-y divide-white/5">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-white/10 font-mono text-[10px] font-bold flex items-center justify-center text-slate-300">
                            {it.quantity}x
                          </span>
                          <span className="text-white font-medium">{it.name}</span>
                        </div>
                        <span className="font-mono text-slate-300 font-bold">
                          ${(it.price_jmd * it.quantity).toLocaleString()} JMD
                        </span>
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
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{order.invoice_url ? 'Update Invoice URL' : 'Upload Invoice URL'}</span>
                    </button>
                  </div>

                  {/* Status Change Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {order.status !== 'invoiced' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'invoiced')}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition cursor-pointer"
                      >
                        Mark Invoiced
                      </button>
                    )}
                    {order.status !== 'paid' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'paid')}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition cursor-pointer"
                      >
                        Mark Paid
                      </button>
                    )}
                    {order.status !== 'delivered' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition cursor-pointer"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[11px] font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload/Attach Invoice URL Modal */}
      {activeInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#1C1434] border-2 border-purple-500/50 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-black">Upload / Attach Invoice</h3>
              </div>
              <button
                onClick={() => setActiveInvoiceOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Attach the official PDF invoice URL or payment link for Order <strong className="text-amber-300 font-mono">#{activeInvoiceOrder.id}</strong> ({activeInvoiceOrder.client_name}).
            </p>

            <form onSubmit={handleSaveInvoiceUrl} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Invoice Document URL / PDF Link</label>
                <input
                  type="url"
                  required
                  value={invoiceUrlInput}
                  onChange={(e) => setInvoiceUrlInput(e.target.value)}
                  placeholder="https://wecareja.com/invoices/ORD-101.pdf"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Order Total:</span>
                  <span className="font-bold text-amber-300">${activeInvoiceOrder.total_jmd.toLocaleString()} JMD</span>
                </div>
                <div className="flex justify-between">
                  <span>Client:</span>
                  <span className="text-white">{activeInvoiceOrder.client_name} ({activeInvoiceOrder.client_phone})</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveInvoiceOrder(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingInvoice}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-black text-white shadow-lg transition cursor-pointer disabled:opacity-50"
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
