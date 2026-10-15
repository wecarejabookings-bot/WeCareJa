import { supabase } from '../lib/supabase';

export interface TopicDirectoryItem {
  id: string;
  card_number: string; // #01, #02...
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  fallback_url?: string;
  category: string;
  badge_text?: string;
  badge_color?: string;
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export const INITIAL_TOPICS_DIRECTORY: TopicDirectoryItem[] = [
  {
    id: 'exclusive_promos',
    card_number: '#01',
    title: 'Exclusive Health Care Promotions & Advertisements',
    subtitle: 'Welcome voucher $500 off, 3x daily elder guardian packages & post-op savings',
    description: 'Discover exclusive discounts for Kingston, St. Andrew & Portmore families. Apply voucher WECARE2026 for JMD $500 off your first clinical visit or wound care session.',
    category: 'Special Deals',
    badge_text: 'Special Deals',
    badge_color: 'from-amber-500 to-orange-500 text-slate-950',
    image_url: '/images/wound_dressing.webp',
    fallback_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400',
    tags: ['Voucher WECARE2026', '3x Daily Elder Care', 'Sterile Wound Care', 'Save JMD $500'],
    is_active: true,
    sort_order: 1
  },
  {
    id: 'hospital_vs_home',
    card_number: '#02',
    title: 'Skip Hospital Waiting — VIP Care Right on Your Sofa',
    subtitle: 'Why wait 8 hours at KPH or Spanish Town? Verified nurse arrives in 15–30 mins',
    description: 'Zero minute hospital emergency room waiting, no taxi gridlock, zero contagion risk. 1-on-1 private licensed nurse delivered right to your bedside.',
    category: 'Home Advantage',
    badge_text: 'Home Advantage',
    badge_color: 'from-rose-500 to-pink-500 text-white',
    image_url: '/images/elderly_vitals.webp',
    fallback_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400',
    tags: ['0 Min Wait Time', 'Zero Contagion Risk', 'No Taxi Gridlock', '1-on-1 Nurse Attention'],
    is_active: true,
    sort_order: 2
  },
  {
    id: 'clinical_services',
    card_number: '#03',
    title: 'In-Home Clinical Nursing Procedures & Rates',
    subtitle: 'Wound care, IV therapy, catheterization, vitals check, medication & senior respite',
    description: 'Transparent JMD pricing for sterile wound dressings, IV cannulation, diabetic insulin administration, and comprehensive vital sign assessments.',
    category: 'Procedures',
    badge_text: 'Procedures',
    badge_color: 'from-blue-600 to-indigo-600 text-white',
    image_url: '/images/iv_therapy.webp',
    fallback_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    tags: ['Wound Dressings', 'IV Drip Therapy', 'Blood Pressure & Glucose', 'Transparent JMD Rates'],
    is_active: true,
    sort_order: 3
  },
  {
    id: 'medical_store',
    card_number: '#04',
    title: 'Medical Supplies & Home Healthcare Equipment Store (/store)',
    subtitle: 'Order BP monitors, pulse oximeters, wheelchairs, commodes, wound kits & diapers',
    description: 'Premium medical supplies with same-day doorstep dispatch in Kingston, St. Andrew & St. Catherine. Pay via NCB, BNS, or credit card.',
    category: 'Supplies & Equipment',
    badge_text: 'Supplies & Equipment',
    badge_color: 'from-emerald-500 to-teal-500 text-slate-950',
    image_url: '/images/bp_monitor.webp',
    fallback_url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500',
    tags: ['Digital BP Monitors', 'Pulse Oximeters', 'Foldable Wheelchairs', 'Adult Diapers & Kits'],
    is_active: true,
    sort_order: 4
  },
  {
    id: 'escrow_security',
    card_number: '#05',
    title: '100% Escrow Protection, NCJ Licensing & Safe Payouts',
    subtitle: 'Funds securely held until service is completed. 100% Nursing Council verified',
    description: 'Peace of mind payments. Client funds are kept in secure escrow until nurse verifies doorstep completion with EHR notes.',
    category: 'Safety & Escrow',
    badge_text: 'Safety & Escrow',
    badge_color: 'from-purple-600 to-indigo-600 text-white',
    image_url: '/images/senior_respite.webp',
    fallback_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=400',
    tags: ['100% Escrow Fund Safety', 'NCJ Verified Staff', 'Live Proximity Engine', 'EHR Clinical Notes'],
    is_active: true,
    sort_order: 5
  },
  {
    id: 'jamaica_health_news',
    card_number: '#06',
    title: 'Official Jamaica Health News & Ministry Advisories (MOHW)',
    subtitle: 'Live Ministry of Health bulletins, Dengue alerts, heatwave tips & community guidance',
    description: 'Stay informed with real-time updates directly from the Ministry of Health & Wellness (MOHW) Jamaica, health bulletins, and tropical wellness guidelines.',
    category: 'Public Health',
    badge_text: 'Public Health',
    badge_color: 'from-sky-500 to-blue-600 text-white',
    image_url: '/images/medication_management.webp',
    fallback_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400',
    tags: ['MOHW Verified Alerts', 'Dengue Prevention', 'Clinic Bulletins', 'Community Wellness'],
    is_active: true,
    sort_order: 6
  },
  {
    id: 'emergency_119',
    card_number: '#07',
    title: '119 Emergency Speed Dial & Instant Medical SOS Beacon',
    subtitle: 'One-tap direct speed dial to Jamaica 119, GPS location broadcast & ER hospital contacts',
    description: 'Critical emergency beacon. Directly speed-dials 119 (Police), 110 (Ambulance & Fire), and sends instant GPS coordinates to emergency dispatchers.',
    category: 'Emergency SOS',
    badge_text: 'Emergency SOS',
    badge_color: 'from-red-600 to-rose-600 text-white',
    image_url: '/images/vitals_monitoring.webp',
    fallback_url: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=400',
    tags: ['119 Police Speed Dial', '110 Fire & Ambulance', 'KPH & Spanish Town ER', 'GPS Beacon'],
    is_active: true,
    sort_order: 7
  },
  {
    id: 'family_reviews',
    card_number: '#08',
    title: 'Verified Jamaican Patient & Family Stories (4.9 ★)',
    subtitle: 'Real reviews from Kingston 6, Portmore Pines, Spanish Town & St. Andrew families',
    description: 'Over 1,420+ completed visits and 4.9 star ratings. Read authentic testimonials from Jamaican families and diaspora relatives managing elder care.',
    category: 'Reviews & Trust',
    badge_text: 'Reviews & Trust',
    badge_color: 'from-amber-400 to-yellow-500 text-slate-950',
    image_url: '/images/mobility_hydration.webp',
    fallback_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=400',
    tags: ['1,420+ Visits Completed', '4.9 Star Rating', 'Verified Patient Feedback', 'Real Jamaican Stories'],
    is_active: true,
    sort_order: 8
  },
  {
    id: 'how_it_works',
    card_number: '#09',
    title: 'How WeCare Works (Simple 3-Step Visual Guide)',
    subtitle: '1. Choose Care -> 2. Matched with Nearby Nurse -> 3. Safe Escrow Payment',
    description: 'Simple 3-step process designed for everyone. Pick clinical service, get matched with closest verified nurse in 15-30 mins, and approve completed care.',
    category: 'How It Works',
    badge_text: 'How It Works',
    badge_color: 'from-cyan-500 to-blue-600 text-white',
    image_url: '/images/palliative_comfort.webp',
    fallback_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400',
    tags: ['Step 1: Pick Service', 'Step 2: Rapid Dispatch (15-30m)', 'Step 3: Escrow Approval'],
    is_active: true,
    sort_order: 9
  },
  {
    id: 'nurse_careers',
    card_number: '#10',
    title: 'Join As a Registered Nurse or Caregiver (Top Earnings)',
    subtitle: 'Earn up to 85% per visit with guaranteed bank transfers (NCB, BNS, JN, Sagicor)',
    description: 'WeCare pays the highest nursing rates in Jamaica. Direct weekly deposits into your NCB, Scotiabank, JN Bank or Sagicor account with flexible scheduling.',
    category: 'Careers & Earnings',
    badge_text: 'Careers & Earnings',
    badge_color: 'from-emerald-500 to-green-600 text-white',
    image_url: '/images/gauze_dressing.webp',
    fallback_url: 'https://images.unsplash.com/photo-1594824813570-781e600570b5?auto=format&fit=crop&q=80&w=400',
    tags: ['Highest Earnings in Jamaica', 'Weekly Bank Deposits', 'Flexible Hours', 'Full Independence'],
    is_active: true,
    sort_order: 10
  }
];

const LOCAL_STORAGE_KEY = 'wecare_topics_directory_cache';

export function getCachedTopics(): TopicDirectoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => a.sort_order - b.sort_order);
      }
    }
  } catch {}
  return INITIAL_TOPICS_DIRECTORY;
}

export function setCachedTopics(items: TopicDirectoryItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('wecare:topics_updated', { detail: items }));
  } catch {}
}

/**
 * Fetch all active topics for the client-facing homepage directory
 */
export async function fetchTopicsDirectory(): Promise<TopicDirectoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('topics_directory')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const formatted: TopicDirectoryItem[] = data.map((d: any) => ({
        id: d.id,
        card_number: d.card_number || '#00',
        title: d.title || '',
        subtitle: d.subtitle || '',
        description: d.description || '',
        image_url: d.image_url || '/images/wound_dressing.webp',
        fallback_url: d.fallback_url || '',
        category: d.category || 'Nursing & Care',
        badge_text: d.badge_text || d.category || '',
        badge_color: d.badge_color || 'from-blue-600 to-indigo-600 text-white',
        tags: Array.isArray(d.tags) ? d.tags : [],
        is_active: d.is_active !== undefined ? Boolean(d.is_active) : true,
        sort_order: Number(d.sort_order ?? 0),
        created_at: d.created_at,
        updated_at: d.updated_at
      }));
      setCachedTopics(formatted);
      return formatted;
    }
  } catch (err) {
    console.warn('[TopicsDirectory] Using cached fallback:', err);
  }

  const cached = getCachedTopics();
  return cached.filter(t => t.is_active);
}

/**
 * Fetch all topics (both active and inactive) for the Admin Manager
 */
export async function fetchAdminTopicsDirectory(): Promise<TopicDirectoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('topics_directory')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const formatted: TopicDirectoryItem[] = data.map((d: any) => ({
        id: d.id,
        card_number: d.card_number || '#00',
        title: d.title || '',
        subtitle: d.subtitle || '',
        description: d.description || '',
        image_url: d.image_url || '/images/wound_dressing.webp',
        fallback_url: d.fallback_url || '',
        category: d.category || 'Nursing & Care',
        badge_text: d.badge_text || d.category || '',
        badge_color: d.badge_color || 'from-blue-600 to-indigo-600 text-white',
        tags: Array.isArray(d.tags) ? d.tags : [],
        is_active: d.is_active !== undefined ? Boolean(d.is_active) : true,
        sort_order: Number(d.sort_order ?? 0),
        created_at: d.created_at,
        updated_at: d.updated_at
      }));
      setCachedTopics(formatted);
      return formatted;
    }
  } catch (err) {
    console.warn('[AdminTopicsDirectory] Using cached topics:', err);
  }

  return getCachedTopics();
}

/**
 * Create a new topic card
 */
export async function createTopicDirectoryItem(
  item: Omit<TopicDirectoryItem, 'created_at' | 'updated_at'>
): Promise<TopicDirectoryItem> {
  const newTopic: TopicDirectoryItem = {
    ...item,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('topics_directory')
      .insert({
        id: newTopic.id,
        card_number: newTopic.card_number,
        title: newTopic.title,
        subtitle: newTopic.subtitle,
        description: newTopic.description,
        image_url: newTopic.image_url,
        fallback_url: newTopic.fallback_url || '',
        category: newTopic.category,
        badge_text: newTopic.badge_text || newTopic.category,
        badge_color: newTopic.badge_color,
        tags: newTopic.tags,
        is_active: newTopic.is_active,
        sort_order: newTopic.sort_order
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      newTopic.id = data.id;
    }
  } catch (err) {
    console.warn('[CreateTopic] Supabase insert error, saved locally:', err);
  }

  const current = getCachedTopics();
  const next = [...current, newTopic].sort((a, b) => a.sort_order - b.sort_order);
  setCachedTopics(next);
  return newTopic;
}

/**
 * Update an existing topic card
 */
export async function updateTopicDirectoryItem(
  id: string,
  updates: Partial<TopicDirectoryItem>
): Promise<boolean> {
  const current = getCachedTopics();
  const index = current.findIndex(t => t.id === id);
  if (index === -1) return false;

  const updatedItem: TopicDirectoryItem = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase
      .from('topics_directory')
      .update({
        card_number: updatedItem.card_number,
        title: updatedItem.title,
        subtitle: updatedItem.subtitle,
        description: updatedItem.description,
        image_url: updatedItem.image_url,
        fallback_url: updatedItem.fallback_url,
        category: updatedItem.category,
        badge_text: updatedItem.badge_text,
        badge_color: updatedItem.badge_color,
        tags: updatedItem.tags,
        is_active: updatedItem.is_active,
        sort_order: updatedItem.sort_order,
        updated_at: updatedItem.updated_at
      })
      .eq('id', id);

    if (error) {
      console.warn('[UpdateTopic] Supabase error:', error);
    }
  } catch (err) {
    console.warn('[UpdateTopic] Network error, synced locally:', err);
  }

  const next = current.map(t => t.id === id ? updatedItem : t).sort((a, b) => a.sort_order - b.sort_order);
  setCachedTopics(next);
  return true;
}

/**
 * Delete a topic card
 */
export async function deleteTopicDirectoryItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('topics_directory')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[DeleteTopic] Supabase delete error:', error);
    }
  } catch (err) {
    console.warn('[DeleteTopic] Error deleting from Supabase:', err);
  }

  const current = getCachedTopics();
  const next = current.filter(t => t.id !== id);
  setCachedTopics(next);
  return true;
}

/**
 * Reorder cards
 */
export async function reorderTopicsDirectory(items: TopicDirectoryItem[]): Promise<boolean> {
  const reordered = items.map((t, idx) => ({
    ...t,
    sort_order: idx + 1
  }));

  setCachedTopics(reordered);

  // Sync sort order to Supabase
  try {
    for (const item of reordered) {
      await supabase
        .from('topics_directory')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);
    }
  } catch (err) {
    console.warn('[ReorderTopics] Error updating sort order:', err);
  }

  return true;
}

/**
 * Reset topics to original 10 cards
 */
export async function resetTopicsToDefault(): Promise<TopicDirectoryItem[]> {
  setCachedTopics(INITIAL_TOPICS_DIRECTORY);

  try {
    for (const t of INITIAL_TOPICS_DIRECTORY) {
      await supabase
        .from('topics_directory')
        .upsert({
          id: t.id,
          card_number: t.card_number,
          title: t.title,
          subtitle: t.subtitle,
          description: t.description,
          image_url: t.image_url,
          fallback_url: t.fallback_url,
          category: t.category,
          badge_text: t.badge_text,
          badge_color: t.badge_color,
          tags: t.tags,
          is_active: t.is_active,
          sort_order: t.sort_order
        });
    }
  } catch (err) {
    console.warn('[ResetTopics] Sync error:', err);
  }

  return INITIAL_TOPICS_DIRECTORY;
}
