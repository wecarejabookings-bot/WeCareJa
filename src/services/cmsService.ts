import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CMSContentItem {
  id: string;
  section: string;
  content_type: 'text' | 'textarea' | 'image' | 'number' | 'link';
  title: string;
  description: string;
  value: string;
  default_value: string;
  updated_at?: string;
  updated_by?: string;
}

export const INITIAL_CMS_ITEMS: CMSContentItem[] = [
  // 1. Homepage Hero
  {
    id: 'homepage_hero_badge',
    section: 'Homepage Hero',
    content_type: 'text',
    title: 'Hero Announcement Badge',
    description: 'Top pill badge above the main homepage headline',
    value: "Jamaica's Premier On-Demand Nursing Network",
    default_value: "Jamaica's Premier On-Demand Nursing Network"
  },
  {
    id: 'homepage_hero_title',
    section: 'Homepage Hero',
    content_type: 'text',
    title: 'Main Headline',
    description: 'Primary large headline on the home page',
    value: 'Hospital-Grade Nursing Care Delivered to Your Bedside',
    default_value: 'Hospital-Grade Nursing Care Delivered to Your Bedside'
  },
  {
    id: 'homepage_hero_subtitle',
    section: 'Homepage Hero',
    content_type: 'textarea',
    title: 'Hero Subtitle',
    description: 'Paragraph below the main headline explaining the value proposition',
    value: 'Skip crowded hospital waiting rooms. Verified, NCJ-licensed Jamaican nurses arrive in 15–30 minutes across Kingston, St. Andrew & St. Catherine.',
    default_value: 'Skip crowded hospital waiting rooms. Verified, NCJ-licensed Jamaican nurses arrive in 15–30 minutes across Kingston, St. Andrew & St. Catherine.'
  },
  {
    id: 'homepage_hero_image',
    section: 'Homepage Hero',
    content_type: 'image',
    title: 'Hero Featured Image',
    description: 'Primary visual banner representing Jamaican nursing care',
    value: '/images/elderly_vitals.webp',
    default_value: '/images/elderly_vitals.webp'
  },
  // 2. Metrics & Trust Badges
  {
    id: 'stat_licensed_nurses',
    section: 'Stats & Trust Metrics',
    content_type: 'text',
    title: 'Licensed Nurses Stat',
    description: 'NCJ compliance metric badge',
    value: '100% NCJ Licensed Nurses',
    default_value: '100% NCJ Licensed Nurses'
  },
  {
    id: 'stat_visits_completed',
    section: 'Stats & Trust Metrics',
    content_type: 'text',
    title: 'Completed Visits Stat',
    description: 'Number of successfully completed patient visits',
    value: '1,420+ Visits Completed',
    default_value: '1,420+ Visits Completed'
  },
  {
    id: 'stat_rating',
    section: 'Stats & Trust Metrics',
    content_type: 'text',
    title: 'Patient Rating Stat',
    description: 'Average verified star rating',
    value: '4.9 ★ Patient Rating',
    default_value: '4.9 ★ Patient Rating'
  },
  {
    id: 'stat_eta',
    section: 'Stats & Trust Metrics',
    content_type: 'text',
    title: 'Proximity ETA Stat',
    description: 'Average arrival time',
    value: '15-30m Proximity ETA',
    default_value: '15-30m Proximity ETA'
  },
  // 3. Contact & Business Information
  {
    id: 'business_address',
    section: 'Contact & Business',
    content_type: 'text',
    title: 'Physical Corporate Address',
    description: 'Corporate business address shown across invoices and footer',
    value: '4 Claudete Drive, St. Catherine, Jamaica',
    default_value: '4 Claudete Drive, St. Catherine, Jamaica'
  },
  {
    id: 'contact_phone',
    section: 'Contact & Business',
    content_type: 'text',
    title: 'Support Telephone / WhatsApp',
    description: 'Direct call line for Jamaican families and patients',
    value: '(876) 582-7613',
    default_value: '(876) 582-7613'
  },
  {
    id: 'contact_email',
    section: 'Contact & Business',
    content_type: 'text',
    title: 'Support & Bookings Email',
    description: 'Official corporate email',
    value: 'wecareja.bookings@gmail.com',
    default_value: 'wecareja.bookings@gmail.com'
  },
  // 4. Promotions & Vouchers
  {
    id: 'first_visit_voucher_code',
    section: 'Promotions & Vouchers',
    content_type: 'text',
    title: 'Welcome Voucher Code',
    description: 'Promotional discount voucher code',
    value: 'WECARE2026',
    default_value: 'WECARE2026'
  },
  {
    id: 'first_visit_voucher_discount',
    section: 'Promotions & Vouchers',
    content_type: 'text',
    title: 'Welcome Voucher Discount Amount',
    description: 'Amount saved with welcome voucher',
    value: 'Save JMD $500',
    default_value: 'Save JMD $500'
  },
  // 5. Emergency SOS
  {
    id: 'emergency_sos_title',
    section: 'Emergency SOS',
    content_type: 'text',
    title: 'Emergency 119 Speed Dial Headline',
    description: 'SOS beacon headline',
    value: '119 Emergency Speed Dial & Instant Medical SOS Beacon',
    default_value: '119 Emergency Speed Dial & Instant Medical SOS Beacon'
  },
  {
    id: 'emergency_sos_subtitle',
    section: 'Emergency SOS',
    content_type: 'textarea',
    title: 'Emergency 119 Speed Dial Details',
    description: 'Instructions when an emergency occurs',
    value: 'One-tap direct speed dial to Jamaica 119 (Police) & 110 (Fire & Ambulance) with live GPS coordinate broadcast to emergency personnel.',
    default_value: 'One-tap direct speed dial to Jamaica 119 (Police) & 110 (Fire & Ambulance) with live GPS coordinate broadcast to emergency personnel.'
  },
  // 6. Nurse Careers & Payout
  {
    id: 'nurse_payout_rate',
    section: 'Nurse Careers',
    content_type: 'text',
    title: 'Nurse Visit Payout Share',
    description: 'Percentage paid to registered nurse caregivers',
    value: '85%',
    default_value: '85%'
  },
  {
    id: 'nurse_career_headline',
    section: 'Nurse Careers',
    content_type: 'text',
    title: 'Nurse Recruitment Headline',
    description: 'Headline on nurse registration card',
    value: 'Join As a Registered Nurse or Caregiver (Top Earnings)',
    default_value: 'Join As a Registered Nurse or Caregiver (Top Earnings)'
  }
];

const LOCAL_STORAGE_CMS_KEY = 'wecare_cms_content_cache';

export function getCachedCMS(): CMSContentItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with any newly added initial items so keys never disappear
        const existingMap = new Map(parsed.map((p: CMSContentItem) => [p.id, p]));
        return INITIAL_CMS_ITEMS.map(initItem => existingMap.get(initItem.id) || initItem);
      }
    }
  } catch {}
  return INITIAL_CMS_ITEMS;
}

export function setCachedCMS(items: CMSContentItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('wecare:cms_updated', { detail: items }));
  } catch {}
}

/**
 * Fetch all CMS items from Supabase
 */
export async function fetchCMSContent(): Promise<CMSContentItem[]> {
  try {
    const { data, error } = await supabase
      .from('app_cms_content')
      .select('*')
      .order('section', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const itemsMap = new Map<string, CMSContentItem>();
      // Initialize with defaults
      INITIAL_CMS_ITEMS.forEach(i => itemsMap.set(i.id, i));

      data.forEach((d: any) => {
        itemsMap.set(d.id, {
          id: d.id,
          section: d.section || 'General',
          content_type: d.content_type || 'text',
          title: d.title || d.id,
          description: d.description || '',
          value: d.value ?? d.default_value ?? '',
          default_value: d.default_value || '',
          updated_at: d.updated_at,
          updated_by: d.updated_by
        });
      });

      const merged = Array.from(itemsMap.values());
      setCachedCMS(merged);
      return merged;
    }
  } catch (err) {
    console.warn('[CMS] Using local CMS fallback:', err);
  }

  return getCachedCMS();
}

/**
 * Update a specific CMS item
 */
export async function updateCMSItem(
  id: string,
  value: string,
  updatedBy: string = 'admin'
): Promise<boolean> {
  const current = getCachedCMS();
  const existing = current.find(c => c.id === id);
  if (!existing) return false;

  const updated: CMSContentItem = {
    ...existing,
    value,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy
  };

  try {
    const { error } = await supabase
      .from('app_cms_content')
      .upsert({
        id: updated.id,
        section: updated.section,
        content_type: updated.content_type,
        title: updated.title,
        description: updated.description,
        value: updated.value,
        default_value: updated.default_value,
        updated_at: updated.updated_at,
        updated_by: updated.updated_by
      });

    if (error) {
      console.warn('[CMS] Supabase update warning:', error);
    }
  } catch (err) {
    console.warn('[CMS] Offline sync:', err);
  }

  const next = current.map(c => c.id === id ? updated : c);
  setCachedCMS(next);
  return true;
}

/**
 * Reset a CMS item to default
 */
export async function resetCMSItem(id: string): Promise<boolean> {
  const current = getCachedCMS();
  const target = current.find(c => c.id === id);
  if (!target) return false;
  return updateCMSItem(id, target.default_value);
}

/**
 * Synchronous getter with fallback
 */
export function getCMSValue(id: string, fallback?: string): string {
  const current = getCachedCMS();
  const item = current.find(c => c.id === id);
  return item?.value || fallback || '';
}

/**
 * React hook to reactively consume any CMS text or image anywhere in the app
 */
export function useCMS(id: string, fallback?: string): string {
  const [val, setVal] = useState<string>(() => getCMSValue(id, fallback));

  useEffect(() => {
    const handleUpdate = () => {
      setVal(getCMSValue(id, fallback));
    };

    window.addEventListener('wecare:cms_updated', handleUpdate);
    return () => {
      window.removeEventListener('wecare:cms_updated', handleUpdate);
    };
  }, [id, fallback]);

  return val;
}
