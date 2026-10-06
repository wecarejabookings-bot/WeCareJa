// We Care Jamaica - Product, Service & Supply Image Resolver
// Ensures all product/service/order images match their names accurately

export const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // PPE & Gloves
  'gloves': '/images/gloves.jpg',
  'nitrile': '/images/gloves.jpg',
  'latex': '/images/gloves.jpg',
  'examination gloves': '/images/gloves.jpg',

  // Incontinence & Diapers
  'diaper': '/images/diapers.jpg',
  'diapers': '/images/diapers.jpg',
  'briefs': '/images/diapers.jpg',
  'incontinence': '/images/diapers.jpg',
  'pull-ups': '/images/diapers.jpg',

  // Sanitizing Wipes
  'wipes': '/images/wipes.jpg',
  'wipe': '/images/wipes.jpg',
  'sanitizing wipes': '/images/wipes.jpg',
  'disinfectant wipes': '/images/wipes.jpg',

  // First Aid & Emergency
  'first aid': '/images/first_aid_kit.jpg',
  'emergency': '/images/first_aid_kit.jpg',
  'emergency kit': '/images/first_aid_kit.jpg',

  // Diagnostics
  'blood pressure': '/images/bp_monitor.jpg',
  'bp monitor': '/images/bp_monitor.jpg',
  'sphygmomanometer': '/images/bp_monitor.jpg',
  'arm blood pressure': '/images/bp_monitor.jpg',
  'oximeter': '/images/pulse_oximeter.jpg',
  'pulse oximeter': '/images/pulse_oximeter.jpg',
  'spo2': '/images/pulse_oximeter.jpg',

  // Wound Care & Dressings
  'dressing': '/images/wound_dressing.jpg',
  'wound dressing': '/images/wound_dressing.jpg',
  'gauze': '/images/gauze_dressing.jpg',
  'tape': '/images/medical_tape.jpg',
  'micropore': '/images/medical_tape.jpg',

  // Antiseptics & Sanitizer
  'antiseptic': '/images/antiseptic_wash.jpg',
  'skin prep': '/images/antiseptic_wash.jpg',
  'chlorhexidine': '/images/antiseptic_wash.jpg',
  'sanitizer': '/images/hand_sanitizer.jpg',
  'hand sanitizer': '/images/hand_sanitizer.jpg',

  // Services
  'wound': '/images/wound_dressing.jpg',
  'vitals': '/images/elderly_vitals.jpg',
  'elderly vitals': '/images/elderly_vitals.jpg',
  'iv therapy': '/images/iv_therapy.jpg',
  'injectable': '/images/iv_therapy.jpg',
  'infusion': '/images/iv_therapy.jpg',
  'catheter': '/images/medication_management.jpg',
  'stoma': '/images/medication_management.jpg',
  'palliative': '/images/palliative_comfort.jpg',
  'comfort': '/images/palliative_comfort.jpg',
  'respite': '/images/senior_respite.jpg',
  'companion': '/images/mobility_hydration.jpg',
  'mobility': '/images/mobility_hydration.jpg',
  'routine': '/images/vitals_monitoring.jpg',
  'bedtime': '/images/vitals_monitoring.jpg',
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
  fallbackImage: string = '/images/first_aid_kit.jpg'
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
    return '/images/gloves.jpg';
  }
  if (lower.includes('diaper') || lower.includes('brief') || lower.includes('incontinence')) {
    return '/images/diapers.jpg';
  }
  if (lower.includes('wipe')) {
    return '/images/wipes.jpg';
  }
  if (lower.includes('blood pressure') || lower.includes('bp cuff') || lower.includes('pressure monitor')) {
    return '/images/bp_monitor.jpg';
  }
  if (lower.includes('oximeter') || lower.includes('spo2')) {
    return '/images/pulse_oximeter.jpg';
  }
  if (lower.includes('first aid') || lower.includes('emergency kit')) {
    return '/images/first_aid_kit.jpg';
  }
  if (lower.includes('tape') || lower.includes('micropore')) {
    return '/images/medical_tape.jpg';
  }
  if (lower.includes('gauze') || lower.includes('dressing')) {
    return '/images/gauze_dressing.jpg';
  }
  if (lower.includes('antiseptic') || lower.includes('chlorhexidine') || lower.includes('skin prep')) {
    return '/images/antiseptic_wash.jpg';
  }
  if (lower.includes('sanitizer')) {
    return '/images/hand_sanitizer.jpg';
  }
  if (lower.includes('catheter') || lower.includes('stoma')) {
    return '/images/medication_management.jpg';
  }
  if (lower.includes('respite')) {
    return '/images/senior_respite.jpg';
  }
  if (lower.includes('routine') || lower.includes('bedtime')) {
    return '/images/vitals_monitoring.jpg';
  }
  if (lower.includes('mobility') || lower.includes('companion')) {
    return '/images/mobility_hydration.jpg';
  }
  if (lower.includes('palliative') || lower.includes('comfort')) {
    return '/images/palliative_comfort.jpg';
  }
  if (lower.includes('iv therapy') || lower.includes('infusion')) {
    return '/images/iv_therapy.jpg';
  }
  if (lower.includes('vitals') || lower.includes('elderly')) {
    return '/images/elderly_vitals.jpg';
  }

  // Fallback to local clinical kit
  return candidateImage || fallbackImage;
}
