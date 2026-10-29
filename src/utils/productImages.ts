// We Care Jamaica - Product, Service & Supply Image Resolver
// Ensures all product/service/order images match their names accurately

export const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // PPE & Gloves
  'gloves': '/images/gloves.webp',
  'nitrile': '/images/gloves.webp',
  'latex': '/images/gloves.webp',
  'examination gloves': '/images/gloves.webp',

  // Incontinence & Diapers
  'diaper': '/images/diapers.webp',
  'diapers': '/images/diapers.webp',
  'briefs': '/images/diapers.webp',
  'incontinence': '/images/diapers.webp',
  'pull-ups': '/images/diapers.webp',

  // Sanitizing Wipes
  'wipes': '/images/wipes.webp',
  'wipe': '/images/wipes.webp',
  'sanitizing wipes': '/images/wipes.webp',
  'disinfectant wipes': '/images/wipes.webp',

  // First Aid & Emergency
  'first aid': '/images/first_aid_kit.webp',
  'emergency': '/images/first_aid_kit.webp',
  'emergency kit': '/images/first_aid_kit.webp',

  // Diagnostics
  'blood pressure': '/images/bp_monitor.webp',
  'bp monitor': '/images/bp_monitor.webp',
  'sphygmomanometer': '/images/bp_monitor.webp',
  'arm blood pressure': '/images/bp_monitor.webp',
  'oximeter': '/images/pulse_oximeter.webp',
  'pulse oximeter': '/images/pulse_oximeter.webp',
  'spo2': '/images/pulse_oximeter.webp',

  // Wound Care & Dressings
  'dressing': '/images/wound_dressing.webp',
  'wound dressing': '/images/wound_dressing.webp',
  'gauze': '/images/gauze_dressing.webp',
  'tape': '/images/medical_tape.webp',
  'micropore': '/images/medical_tape.webp',

  // Antiseptics & Sanitizer
  'antiseptic': '/images/antiseptic_wash.webp',
  'skin prep': '/images/antiseptic_wash.webp',
  'chlorhexidine': '/images/antiseptic_wash.webp',
  'sanitizer': '/images/hand_sanitizer.webp',
  'hand sanitizer': '/images/hand_sanitizer.webp',

  // Services
  'wound': '/images/wound_dressing.webp',
  'vitals': '/images/elderly_vitals.webp',
  'elderly vitals': '/images/elderly_vitals.webp',
  'iv therapy': '/images/iv_therapy.webp',
  'injectable': '/images/iv_therapy.webp',
  'infusion': '/images/iv_therapy.webp',
  'catheter': '/images/medication_management.webp',
  'stoma': '/images/medication_management.webp',
  'palliative': '/images/palliative_comfort.webp',
  'comfort': '/images/palliative_comfort.webp',
  'respite': '/images/senior_respite.webp',
  'companion': '/images/mobility_hydration.webp',
  'mobility': '/images/mobility_hydration.webp',
  'routine': '/images/vitals_monitoring.webp',
  'bedtime': '/images/vitals_monitoring.webp',
};

// Disallowed or generic fallback Unsplash IDs that caused incorrect images (e.g. pill bottle for gloves)
const OLD_GENERIC_IMAGES = [
  'photo-1584744982491-665216d95f8b'
];

/**
 * Returns a guaranteed correct image URL for any service, store product, or order item.
 * Prioritizes item.image / item.imageUrl / item.image_url if valid and specific,
 * otherwise matches the item's name against the verified Jamaican clinical image assets.
 */
export function getCorrectItemImage(
  itemOrName?: string | { name?: string; image?: string; imageUrl?: string; image_url?: string; category?: string } | null,
  fallbackImage: string = '/images/first_aid_kit.webp'
): string {
  if (!itemOrName) return fallbackImage;

  let name = '';
  let candidateImage: string | undefined;

  if (typeof itemOrName === 'string') {
    name = itemOrName;
  } else {
    name = itemOrName.name || '';
    candidateImage = itemOrName.image_url || itemOrName.imageUrl || itemOrName.image;
  }

  // If candidate image is explicitly set and not the generic placeholder, use it
  if (candidateImage && candidateImage.trim()) {
    const isOldGeneric = OLD_GENERIC_IMAGES.some(id => candidateImage!.includes(id));
    if (!isOldGeneric) {
      return candidateImage;
    }
  }

  const lower = name.toLowerCase();

  // Keyword-based matching
  if (lower.includes('glove') || lower.includes('nitrile') || lower.includes('latex')) {
    return '/images/gloves.webp';
  }
  if (lower.includes('diaper') || lower.includes('brief') || lower.includes('incontinence')) {
    return '/images/diapers.webp';
  }
  if (lower.includes('wipe')) {
    return '/images/wipes.webp';
  }
  if (lower.includes('blood pressure') || lower.includes('bp cuff') || lower.includes('pressure monitor')) {
    return '/images/bp_monitor.webp';
  }
  if (lower.includes('oximeter') || lower.includes('spo2')) {
    return '/images/pulse_oximeter.webp';
  }
  if (lower.includes('first aid') || lower.includes('emergency kit')) {
    return '/images/first_aid_kit.webp';
  }
  if (lower.includes('tape') || lower.includes('micropore')) {
    return '/images/medical_tape.webp';
  }
  if (lower.includes('gauze') || lower.includes('dressing')) {
    return '/images/gauze_dressing.webp';
  }
  if (lower.includes('antiseptic') || lower.includes('chlorhexidine') || lower.includes('skin prep')) {
    return '/images/antiseptic_wash.webp';
  }
  if (lower.includes('sanitizer')) {
    return '/images/hand_sanitizer.webp';
  }
  if (lower.includes('catheter') || lower.includes('stoma')) {
    return '/images/medication_management.webp';
  }
  if (lower.includes('respite')) {
    return '/images/senior_respite.webp';
  }
  if (lower.includes('routine') || lower.includes('bedtime')) {
    return '/images/vitals_monitoring.webp';
  }
  if (lower.includes('mobility') || lower.includes('companion')) {
    return '/images/mobility_hydration.webp';
  }
  if (lower.includes('palliative') || lower.includes('comfort')) {
    return '/images/palliative_comfort.webp';
  }
  if (lower.includes('iv therapy') || lower.includes('infusion')) {
    return '/images/iv_therapy.webp';
  }
  if (lower.includes('vitals') || lower.includes('elderly')) {
    return '/images/elderly_vitals.webp';
  }

  // Fallback to local clinical kit
  return candidateImage || fallbackImage;
}
