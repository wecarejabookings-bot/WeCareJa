import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Star, 
  Check, 
  ZoomIn, 
  Maximize2, 
  RotateCcw, 
  Plus, 
  Minus, 
  Sparkles, 
  Package, 
  Clock, 
  MapPin, 
  Info,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { MedicalSupplyItem, ProductColorOption, ProductSizeOption } from '../../types';
import { soundFX } from '../../utils/soundEffects';

interface ProductDetailModalProps {
  product: MedicalSupplyItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MedicalSupplyItem, quantity: number, selectedColor?: string, selectedSize?: string, customPrice?: number) => void;
  onBuyNow: (item: MedicalSupplyItem, quantity: number, selectedColor?: string, selectedSize?: string, customPrice?: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow
}) => {
  // Angle gallery state
  const angles = product.angles && product.angles.length > 0 
    ? product.angles 
    : [{ angle: 'front', label: 'Primary View', image_url: product.image_url || '/images/first_aid_kit.webp' }];
  
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);

  // Variant states: color & size
  const colors = product.colors && product.colors.length > 0 
    ? product.colors 
    : [{ name: 'Standard Clinical', hex: '#0284C7' }];
  const [selectedColor, setSelectedColor] = useState<ProductColorOption>(colors[0]);

  const sizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : [{ id: 'std', name: 'Standard Unit', label: 'Standard Unit', price_delta_jmd: 0, in_stock: true }];
  const [selectedSize, setSelectedSize] = useState<ProductSizeOption>(sizes[0]);

  // Quantity state
  const [quantity, setQuantity] = useState(1);

  // Added-to-cart temporary notification
  const [addedToast, setAddedToast] = useState(false);

  // Zoom / Magnifier states
  const [isZoomLensActive, setIsZoomLensActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Reset states when product changes
  useEffect(() => {
    setActiveAngleIndex(0);
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setQuantity(1);
    setIsLightboxOpen(false);
    setLightboxZoom(1);
  }, [product.id]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLightboxOpen, onClose]);

  if (!isOpen) return null;

  // Calculate dynamic price
  const basePrice = product.price_jmd;
  const priceDelta = selectedSize.price_delta_jmd || 0;
  const unitPrice = Math.max(0, basePrice + priceDelta);
  const subtotal = unitPrice * quantity;
  const listPriceMSRP = Math.round(unitPrice * 1.18);
  const savingsJMD = listPriceMSRP - unitPrice;
  const approxUSD = (unitPrice / 156).toFixed(2);

  // Active displayed image (can be angle image or color-specific image)
  const currentAngle = angles[activeAngleIndex] || angles[0];
  const activeImageUrl = (activeAngleIndex === 0 && selectedColor.image_url) 
    ? selectedColor.image_url 
    : currentAngle.image_url;

  // Zoom mouse handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    soundFX.playToggleClick();
    onAddToCart(
      product,
      quantity,
      selectedColor.name,
      selectedSize.label,
      unitPrice
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  const handleBuyNow = () => {
    soundFX.playSuccessPing();
    onBuyNow(
      product,
      quantity,
      selectedColor.name,
      selectedSize.label,
      unitPrice
    );
  };

  const nextAngle = () => {
    setActiveAngleIndex(prev => (prev + 1) % angles.length);
  };

  const prevAngle = () => {
    setActiveAngleIndex(prev => (prev - 1 + angles.length) % angles.length);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
        <div className="bg-[#120B24] border border-white/15 rounded-3xl max-w-5xl w-full max-h-[94vh] overflow-y-auto shadow-2xl text-white flex flex-col relative my-auto scrollbar-thin">
          
          {/* Top Bar with Breadcrumbs & Close */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#120B24]/95 backdrop-blur-xl z-20">
            <div className="flex items-center gap-2 text-xs text-slate-400 overflow-hidden truncate">
              <span className="hover:text-emerald-400 transition cursor-pointer" onClick={onClose}>
                Medical Store
              </span>
              <span>/</span>
              <span className="text-emerald-400 font-bold">{product.category}</span>
              <span>/</span>
              <span className="text-white truncate font-medium max-w-[200px] sm:max-w-[320px]">
                {product.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: product.description,
                      url: window.location.href
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    soundFX.playSuccessPing();
                  }
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                title="Share Item"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Added to Cart Notification Toast */}
          {addedToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce-subtle">
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Added to your Medical Supply Cart! ({quantity}x {selectedSize.label})</span>
            </div>
          )}

          {/* Modal Main Content: 2-Column Amazon Layout */}
          <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* LEFT COLUMN: Multi-Angle Thumbnails + Main Large Enlargeable Image (5 cols) */}
            <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 select-none">
              
              {/* Vertical Thumbnails Strip (Horizontal on small screens) */}
              <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[460px] pb-1 sm:pb-0 scrollbar-none shrink-0">
                {angles.map((ang, idx) => {
                  const isActive = idx === activeAngleIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveAngleIndex(idx);
                        soundFX.playToggleClick();
                      }}
                      onMouseEnter={() => setActiveAngleIndex(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 transition-all p-0.5 shrink-0 bg-slate-950/80 cursor-pointer ${
                        isActive 
                          ? 'border-amber-400 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/30 scale-102' 
                          : 'border-white/10 hover:border-white/40 opacity-70 hover:opacity-100'
                      }`}
                      title={ang.label}
                    >
                      <img 
                        src={ang.image_url} 
                        alt={ang.label}
                        className="w-full h-full object-cover rounded-xl"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/first_aid_kit.webp';
                        }}
                      />
                      <span className="absolute bottom-0.5 inset-x-0 bg-black/80 text-[8px] font-mono text-center text-slate-300 truncate px-0.5">
                        {ang.angle.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Main Large Image Stage with Interactive Zoom Lens */}
              <div className="flex-1 flex flex-col">
                <div 
                  ref={imageContainerRef}
                  onMouseEnter={() => setIsZoomLensActive(true)}
                  onMouseLeave={() => setIsZoomLensActive(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative w-full h-[320px] sm:h-[400px] md:h-[440px] rounded-3xl bg-slate-950/90 border border-white/15 overflow-hidden group cursor-crosshair flex items-center justify-center p-3 shadow-inner"
                >
                  {/* Default Crisp Image */}
                  <img 
                    src={activeImageUrl} 
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-200 select-none"
                    style={{
                      transform: isZoomLensActive ? 'scale(1.03)' : 'scale(1)'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/first_aid_kit.webp';
                    }}
                  />

                  {/* Amazon-Style Interactive Zoom Lens Magnifier */}
                  {isZoomLensActive && (
                    <div 
                      className="absolute inset-0 pointer-events-none transition-opacity duration-150 hidden md:block"
                      style={{
                        backgroundImage: `url(${activeImageUrl})`,
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                        backgroundSize: '240%',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] font-black uppercase text-amber-300 border border-amber-400/40 flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{currentAngle.label}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-950/90 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                      MOHW Jamaica Approved
                    </span>
                  </div>

                  {/* Zoom Instructions & Lightbox Button */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] text-slate-300 border border-white/15 hidden sm:flex items-center gap-1">
                      <ZoomIn className="w-3 h-3 text-amber-300" /> Hover to Zoom
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition cursor-pointer"
                      title="Open Fullscreen Lightbox"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Previous / Next Angle Arrows */}
                  {angles.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevAngle();
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition cursor-pointer opacity-80 hover:opacity-100"
                        title="Previous Angle"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextAngle();
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition cursor-pointer opacity-80 hover:opacity-100"
                        title="Next Angle"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Sub-strip Angle Indicators */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Angle {activeAngleIndex + 1} of {angles.length}: <strong className="text-white">{currentAngle.label}</strong></span>
                  <span className="text-amber-300 font-mono">Click picture to enlarge</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Amazon Product Info, Customizer & Buy Box (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
              
              {/* Product Header & Rating */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    WeCare Top Pick
                  </span>
                  <span className="text-xs text-slate-400">
                    Brand: <span className="text-emerald-400 font-bold">{product.brand || 'WeCare Medical Jamaica'}</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-white">{product.rating || 4.9}</span>
                  <span className="text-slate-400">({product.review_count || 128} verified clinical ratings)</span>
                  <span className="text-emerald-400 font-semibold">• 98% Recommend</span>
                </div>

                <div className="h-px bg-white/10" />

                {/* Pricing Block */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                      ${unitPrice.toLocaleString()} <span className="text-xs font-sans text-slate-300 font-bold">JMD</span>
                    </span>
                    <span className="text-xs text-slate-400 line-through font-mono">
                      ${listPriceMSRP.toLocaleString()} JMD
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      Save ${(savingsJMD).toLocaleString()} JMD (15% off)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Estimated equivalent: <strong className="text-slate-200">${approxUSD} USD</strong> • Duty-free medical homecare rate
                  </p>
                </div>

                {/* Jamaica Delivery Perks */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>FREE Islandwide Courier Delivery on orders over $10,000 JMD</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Kingston &amp; St. Andrew: Same-Day / 2-4 Hr Emergency Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>In Stock — Ships directly from Central Kingston Medical Depot</span>
                  </div>
                </div>
              </div>

              {/* 1. DIFFERENT COLORS SELECTOR */}
              {colors.length > 1 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Color: <strong className="text-white font-bold">{selectedColor.name}</strong>
                    </span>
                    <span className="text-[10px] text-slate-500">{colors.length} choices</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {colors.map((c) => {
                      const isSelected = selectedColor.name === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setSelectedColor(c);
                            soundFX.playToggleClick();
                          }}
                          className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'bg-white/15 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                              : 'bg-white/5 hover:bg-white/10 border-white/10'
                          }`}
                          title={`Select ${c.name}`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full border border-white/40 shadow-sm shrink-0" 
                            style={{ backgroundColor: c.hex }} 
                          />
                          <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {c.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. DIFFERENT SIZES / VARIANT SELECTOR */}
              {sizes.length > 1 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Size / Package Option: <strong className="text-white font-bold">{selectedSize.name}</strong>
                    </span>
                    {selectedSize.price_delta_jmd ? (
                      <span className="text-[11px] font-mono text-amber-300 font-bold">
                        +{selectedSize.price_delta_jmd.toLocaleString()} JMD
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400">Standard Price</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sizes.map((s) => {
                      const isSelected = selectedSize.id === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedSize(s);
                            soundFX.playToggleClick();
                          }}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400/15 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                              : 'bg-white/5 hover:bg-white/10 border-white/10'
                          }`}
                        >
                          <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                            {s.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {s.price_delta_jmd ? `+${s.price_delta_jmd.toLocaleString()} JMD` : 'Included'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. QUANTITY & ORDER BUTTONS (BUY BOX) */}
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/30 space-y-4 shadow-xl">
                
                {/* Quantity + Subtotal Row */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Quantity</span>
                    <div className="flex items-center gap-1.5 mt-1 bg-white/5 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-sm text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(product.stock || 20, quantity + 1))}
                        disabled={quantity >= (product.stock || 20)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Item Total</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                      ${subtotal.toLocaleString()} <span className="text-xs font-sans text-slate-300 font-normal">JMD</span>
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-950" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-slate-950" />
                    <span>Buy Now / Order</span>
                  </button>
                </div>

                {/* Safety Guarantee */}
                <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% Genuine Clinical Quality</span>
                  </span>
                  <span>•</span>
                  <span>30-Day Defect Guarantee</span>
                </div>
              </div>

              {/* 4. ABOUT THIS ITEM (AMAZON BULLET POINTS) */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    About this item
                  </h4>
                  <ul className="space-y-2">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 5. TECHNICAL SPECIFICATIONS TABLE */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Technical Specifications
                  </h4>
                  <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 text-xs">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-12 py-2 px-3 bg-white/[0.02]">
                        <span className="col-span-5 font-bold text-slate-400">{key}</span>
                        <span className="col-span-7 text-white font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN ZOOM LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fade-in"
        >
          {/* Lightbox Controls Header */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{product.name}</span>
              <span className="text-xs text-amber-300 font-mono">({currentAngle.label})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxZoom(prev => Math.min(3, prev + 0.5));
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxZoom(prev => Math.max(1, prev - 0.5));
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxZoom(1);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Image Center Stage */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center overflow-auto p-4"
          >
            <img 
              src={activeImageUrl} 
              alt={product.name}
              className="max-h-[82vh] max-w-full object-contain transition-transform duration-200 select-none shadow-2xl"
              style={{ transform: `scale(${lightboxZoom})` }}
            />
          </div>

          {/* Lightbox Bottom Angles Strip */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-3 overflow-x-auto py-2 z-10"
          >
            {angles.map((ang, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveAngleIndex(idx);
                  setLightboxZoom(1);
                }}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition p-0.5 cursor-pointer bg-slate-900 ${
                  idx === activeAngleIndex 
                    ? 'border-amber-400 ring-2 ring-amber-400/40' 
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={ang.image_url} alt={ang.label} className="w-full h-full object-cover rounded-lg" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
