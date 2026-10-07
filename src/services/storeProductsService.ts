import { supabase } from '../supabaseClient';
import { StoreProduct } from '../types';

export const INITIAL_STORE_PRODUCTS: StoreProduct[] = [
  { id: 'prod-1', name: 'Digital Blood Pressure Monitor', description: 'Automatic BP monitor', category: 'Equipment', price_jmd: 8500, stock_qty: 15, image_url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500', is_active: true },
  { id: 'prod-2', name: 'Disposable Gloves Box', description: 'Box 100 latex gloves', category: 'Supplies', price_jmd: 2500, stock_qty: 30, image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', is_active: true },
  { id: 'prod-3', name: 'First Aid Kit', description: 'Complete home kit', category: 'Kits', price_jmd: 6500, stock_qty: 20, image_url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500', is_active: true },
  { id: 'prod-4', name: 'Wheelchair', description: 'Foldable wheelchair', category: 'Equipment', price_jmd: 45000, stock_qty: 5, image_url: 'https://images.unsplash.com/photo-1580281658626-ee37972c3d73?w=500', is_active: true },
  { id: 'prod-5', name: 'Walking Cane', description: 'Adjustable cane', category: 'Mobility', price_jmd: 3500, stock_qty: 25, image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500', is_active: true },
  { id: 'prod-6', name: 'Adult Diapers Pack', description: 'Pack of 20', category: 'Supplies', price_jmd: 4000, stock_qty: 40, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', is_active: true },
  { id: 'prod-7', name: 'Hand Sanitizer 500ml', description: 'Antibacterial', category: 'Hygiene', price_jmd: 1200, stock_qty: 50, image_url: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=500', is_active: true },
  { id: 'prod-8', name: 'Digital Thermometer', description: 'Infrared thermometer', category: 'Equipment', price_jmd: 3000, stock_qty: 20, image_url: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500', is_active: true },
  { id: 'prod-9', name: 'Bedside Commode', description: 'Portable toilet chair', category: 'Equipment', price_jmd: 18000, stock_qty: 8, image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500', is_active: true },
  { id: 'prod-10', name: 'Compression Socks', description: 'Medical socks pair', category: 'Supplies', price_jmd: 2000, stock_qty: 35, image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500', is_active: true },
  { id: 'prod-11', name: 'Wound Dressing Pack', description: 'Sterile dressing kit', category: 'Supplies', price_jmd: 1500, stock_qty: 60, image_url: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=500', is_active: true },
  { id: 'prod-12', name: 'Pill Organizer', description: 'Weekly pill box', category: 'Supplies', price_jmd: 800, stock_qty: 100, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', is_active: true },
];

const LOCAL_STORAGE_KEY = 'wecare_store_products_cache';

function getCachedProducts(): StoreProduct[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_STORE_PRODUCTS;
}

function setCachedProducts(products: StoreProduct[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch {}
}

export async function fetchAdminStoreProducts(): Promise<StoreProduct[]> {
  try {
    const { data, error } = await supabase
      .from('store_products')
      .select('*')
      .order('name', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const prods: StoreProduct[] = data.map((d: any) => ({
        id: d.id,
        name: d.name || '',
        description: d.description || '',
        category: d.category || 'Supplies',
        price_jmd: Number(d.price_jmd) || 0,
        stock_qty: Number(d.stock_qty ?? 10),
        image_url: d.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
        is_active: d.is_active !== undefined ? Boolean(d.is_active) : true
      }));
      setCachedProducts(prods);
      return prods;
    }
  } catch (err) {
    console.warn('Could not fetch store_products from Supabase:', err);
  }
  return getCachedProducts();
}

export async function fetchClientStoreProducts(): Promise<StoreProduct[]> {
  try {
    const { data, error } = await supabase
      .from('store_products')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const prods: StoreProduct[] = data.map((d: any) => ({
        id: d.id,
        name: d.name || '',
        description: d.description || '',
        category: d.category || 'Supplies',
        price_jmd: Number(d.price_jmd) || 0,
        stock_qty: Number(d.stock_qty ?? 10),
        image_url: d.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
        is_active: true
      }));
      return prods;
    }
  } catch (err) {
    console.warn('Could not fetch active store_products from Supabase:', err);
  }
  return getCachedProducts().filter(p => p.is_active);
}

export async function createStoreProduct(product: Omit<StoreProduct, 'id'>): Promise<StoreProduct> {
  const newId = `prod-${Date.now().toString().slice(-6)}`;
  const item: StoreProduct = {
    id: newId,
    ...product
  };

  try {
    const { data, error } = await supabase
      .from('store_products')
      .insert({
        name: product.name,
        description: product.description,
        category: product.category,
        price_jmd: product.price_jmd,
        stock_qty: product.stock_qty,
        image_url: product.image_url,
        is_active: product.is_active
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      item.id = data.id;
    }
  } catch (err) {
    console.warn('Error inserting to store_products in Supabase:', err);
  }

  const current = getCachedProducts();
  setCachedProducts([item, ...current]);
  return item;
}

export async function updateStoreProduct(id: string, updates: Partial<StoreProduct>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('store_products')
      .update(updates)
      .eq('id', id);
    if (error) console.warn('Update store_product error:', error);
  } catch (err) {
    console.warn('Could not update store_product in Supabase:', err);
  }

  const current = getCachedProducts();
  const updated = current.map(p => p.id === id ? { ...p, ...updates } : p);
  setCachedProducts(updated);
  return true;
}

export async function deleteStoreProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('store_products')
      .delete()
      .eq('id', id);
    if (error) console.warn('Delete store_product error:', error);
  } catch (err) {
    console.warn('Could not delete store_product from Supabase:', err);
  }

  const current = getCachedProducts();
  setCachedProducts(current.filter(p => p.id !== id));
  return true;
}
