import { MedicalSupplyItem, ProductAngleImage, ProductColorOption, ProductSizeOption, StoreProduct } from '../types';

/**
 * Detailed Amazon-style product data and catalog enhancer.
 * Provides multi-angle photography, real color swatches, sizes/variants,
 * specifications, and feature bullet points for medical store items.
 */

interface AmazonProductProfile {
  brand: string;
  rating: number;
  review_count: number;
  angles: ProductAngleImage[];
  colors: ProductColorOption[];
  sizes: ProductSizeOption[];
  features: string[];
  specifications: Record<string, string>;
}

export const PRODUCT_PROFILES: Record<string, AmazonProductProfile> = {
  // 1. Digital Blood Pressure Monitor
  'prod-1': {
    brand: 'Omron Clinician Series (Jamaica Edition)',
    rating: 4.9,
    review_count: 184,
    angles: [
      { angle: 'front', label: 'Front Display', image_url: '/images/bp_monitor.webp' },
      { angle: 'side', label: 'Angle & Cuff Fit', image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800' },
      { angle: 'detail', label: 'LCD Screen Detail', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800' },
      { angle: 'in_use', label: 'In-Use / Patient Vitals', image_url: '/images/elderly_vitals.webp' },
      { angle: 'packaging', label: 'Zippered Storage Case', image_url: '/images/bp_monitor.jpg' }
    ],
    colors: [
      { name: 'Classic Clinical Navy', hex: '#1E3A8A', image_url: '/images/bp_monitor.webp' },
      { name: 'Arctic White', hex: '#F8FAFC', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800' },
      { name: 'Titanium Graphite', hex: '#334155', image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800' }
    ],
    sizes: [
      { id: 'size-cuff-std', name: 'Standard Adult Cuff (22-32 cm)', label: 'Standard Adult (22-32 cm)', price_delta_jmd: 0, in_stock: true },
      { id: 'size-cuff-xl', name: 'Wide-Range XL Cuff (22-42 cm)', label: 'Wide-Range XL (22-42 cm)', price_delta_jmd: 800, in_stock: true },
      { id: 'size-cuff-dual', name: 'Dual Family Kit (Standard + XL + Pediatric)', label: 'Dual Family Kit (+XL & Pediatric)', price_delta_jmd: 1600, in_stock: true }
    ],
    features: [
      'Clinically Validated Accuracy: Exceeds European Society of Hypertension and MOHW Jamaica standards with precision pressure sensors.',
      'One-Touch Fully Automatic Operation: Inflates smoothly with quiet pump technology and displays systolic, diastolic, and pulse rate in under 30 seconds.',
      'Hypertension & Irregular Heartbeat Indicator: Alerts family caregivers immediately if cardiac arrhythmia or irregular rhythm is detected.',
      'Dual-User 200-Reading Memory: Stores 100 historical readings each for 2 separate users with automated AM/PM weekly averages.',
      'Complete Kit with Batteries: Includes 4 Duracell AA alkaline batteries, quick-connect latex-free contoured arm cuff, and travel carry case.'
    ],
    specifications: {
      'Measurement Method': 'Oscillometric automated measurement',
      'Blood Pressure Range': '0 to 299 mmHg (Accuracy: ±3 mmHg)',
      'Pulse Rate Range': '40 to 180 beats/min (Accuracy: ±5%)',
      'Power Source': '4 x AA Alkaline Batteries or 5V Type-C USB Cable',
      'Display': 'High-contrast backlit LCD with oversized digits',
      'Certifications': 'MOHW Jamaica Approved, FDA 510(k), CE 0123',
      'Warranty': '2 Years Official WeCare Jamaican Distributor Replacement Warranty'
    }
  },

  // 2. Disposable Gloves Box (100 Count)
  'prod-2': {
    brand: 'MediShield Clinical Nitrile Pro',
    rating: 4.8,
    review_count: 242,
    angles: [
      { angle: 'front', label: 'Box Packaging (100ct)', image_url: '/images/gloves.webp' },
      { angle: 'side', label: 'Dispenser Top View', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
      { angle: 'detail', label: 'Micro-Textured Fingertips', image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800' },
      { angle: 'in_use', label: 'Sterile Wound Care Application', image_url: '/images/wound_dressing.webp' }
    ],
    colors: [
      { name: 'Hospital Cyan Blue', hex: '#0284C7', image_url: '/images/gloves.webp' },
      { name: 'Lavender Violet', hex: '#7C3AED', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
      { name: 'Pure Pearl White', hex: '#F1F5F9', image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800' },
      { name: 'Obsidian Black', hex: '#0F172A', image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800' }
    ],
    sizes: [
      { id: 'size-gloves-s', name: 'Small (Snug Fit 7.0-7.5 cm)', label: 'Small (S)', price_delta_jmd: 0, in_stock: true },
      { id: 'size-gloves-m', name: 'Medium (Universal 8.0-8.5 cm)', label: 'Medium (M)', price_delta_jmd: 0, in_stock: true },
      { id: 'size-gloves-l', name: 'Large (Comfort 9.0-9.5 cm)', label: 'Large (L)', price_delta_jmd: 0, in_stock: true },
      { id: 'size-gloves-xl', name: 'Extra Large (XL 10.0+ cm)', label: 'Extra Large (XL)', price_delta_jmd: 200, in_stock: true },
      { id: 'size-gloves-case', name: 'Case of 10 Boxes (1,000 Gloves Bulk)', label: 'Bulk Case (1,000 ct)', price_delta_jmd: 19500, in_stock: true }
    ],
    features: [
      '100% Powder-Free & Latex-Free: Zero natural rubber latex prevents contact dermatitis, itching, and allergies for caregivers and patients.',
      'Medical-Grade 4.0 Mil Barrier: Heavy-duty puncture, tear, and chemical resistance against bodily fluids, disinfectants, and isopropyl alcohol.',
      'Micro-Textured Grip: Enhanced tactile sensitivity on fingers allows delicate handling of insulin syringes, IV lines, and sterile dressings.',
      'Beaded Roll Cuff: Provides effortless donning, prevents roll-down during active homecare shifts, and fits both left and right hands.'
    ],
    specifications: {
      'Material': '100% Medical Grade Synthetic Nitrile',
      'Thickness': '4.0 mil (fingertips) / 3.5 mil (palm)',
      'Count per Box': '100 gloves by weight dispenser pack',
      'Tensile Strength': 'Exceeds 18 MPa (High elasticity)',
      'Quality Standard': 'ASTM D6319 & EN 455-1/2/3 Hospital Standard',
      'Shelf Life': '5 Years'
    }
  },

  // 3. First Aid Kit
  'prod-3': {
    brand: 'Lifeline Jamaica Medical Trauma Pack',
    rating: 4.9,
    review_count: 98,
    angles: [
      { angle: 'front', label: 'Primary Hardcover Case', image_url: '/images/first_aid_kit.webp' },
      { angle: 'side', label: 'Organized Compartments View', image_url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800' },
      { angle: 'detail', label: 'Trauma Shears & Dressings', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800' },
      { angle: 'in_use', label: 'Home Emergency Setup', image_url: '/images/palliative_comfort.webp' }
    ],
    colors: [
      { name: 'Emergency Signal Red', hex: '#DC2626', image_url: '/images/first_aid_kit.webp' },
      { name: 'Tactical Matte Black', hex: '#0F172A', image_url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800' },
      { name: 'High-Visibility Safety Orange', hex: '#EA580C', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800' }
    ],
    sizes: [
      { id: 'size-kit-home', name: 'Home Essential (65 Items)', label: 'Home Care (65 Pcs)', price_delta_jmd: 0, in_stock: true },
      { id: 'size-kit-deluxe', name: 'Family & Elder Deluxe (120 Items + Shears)', label: 'Family Deluxe (120 Pcs)', price_delta_jmd: 2200, in_stock: true },
      { id: 'size-kit-field', name: 'Emergency Vehicle & Heavy Trauma (180 Items)', label: 'Field Trauma (180 Pcs)', price_delta_jmd: 4800, in_stock: true }
    ],
    features: [
      'Comprehensive 120-Piece Hospital Pack: Equipped for cuts, severe burns, sprains, bleeding control, and post-surgical wound care at home.',
      'Heavy-Duty Water-Repellent Nylon: 600D rugged fabric case with clear transparent fold-out sleeves for immediate access in high-stress moments.',
      'Emergency Trauma Tools: Includes stainless steel medical bandage shears, CPR resuscitator face shield, silver thermal shock blanket, and cold pack.',
      'Antiseptic & Wound Care Essentials: Conforming stretch gauze rolls, triangular sling, sterile eye pads, butterfly closures, and povidone-iodine pads.'
    ],
    specifications: {
      'Case Material': '600D Heavy Ripstop Water-Repellent Ballistic Nylon',
      'Total Components': 'Up to 180 sterile clinical items',
      'Dimensions': '24 cm x 18 cm x 9.5 cm (Weight: 1.2 kg)',
      'Certifications': 'OSHA / ANSI/ISEA Z308.1-2021 Clinical Standard',
      'Component Expiry': 'Guaranteed 3+ Years remaining shelf life on sterile items'
    }
  },

  // 4. Wheelchair
  'prod-4': {
    brand: 'Drive Medical Lightweight Pro (Kingston)',
    rating: 4.9,
    review_count: 76,
    angles: [
      { angle: 'front', label: 'Full Profile View', image_url: 'https://images.unsplash.com/photo-1580281658626-ee37972c3d73?w=800' },
      { angle: 'side', label: 'Folded Compact Side View', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800' },
      { angle: 'detail', label: 'Dual Hand Brakes & Footrests', image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800' },
      { angle: 'in_use', label: 'Caregiver Assisted Mobility', image_url: '/images/senior_respite.webp' }
    ],
    colors: [
      { name: 'Cobalt Blue Enamel', hex: '#1D4ED8', image_url: 'https://images.unsplash.com/photo-1580281658626-ee37972c3d73?w=800' },
      { name: 'Charcoal Matte Black', hex: '#1F2937', image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800' },
      { name: 'Polished Chrome Silver', hex: '#94A3B8', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800' }
    ],
    sizes: [
      { id: 'size-wheel-18', name: '18-inch Standard Seat (Capacity: 250 lbs)', label: '18" Seat (250 lbs max)', price_delta_jmd: 0, in_stock: true },
      { id: 'size-wheel-20', name: '20-inch Wide Comfort Seat (Capacity: 300 lbs)', label: '20" Wide Seat (300 lbs)', price_delta_jmd: 3500, in_stock: true },
      { id: 'size-wheel-22', name: '22-inch Bariatric Heavy-Duty (Capacity: 400 lbs)', label: '22" Bariatric (400 lbs)', price_delta_jmd: 8500, in_stock: true }
    ],
    features: [
      'Ultra-Lightweight 19.5 lb Aluminum Frame: Easily lifted by caregivers into sedan trunks or taxis across Jamaica without back strain.',
      '3-Second Quick Fold Mechanism: Collapses flat with fold-down backrest for effortless storage in closets and vehicle boots.',
      'Puncture-Proof Flat-Free Tires: 8-inch solid polyurethane composite wheels glide smoothly over veranda tiles, sidewalk pavers, and asphalt.',
      'Attendant Dual Handbrakes: Ergonomic brake handles on push canes allow the caregiver to stop safely on ramps and slopes with parking locks.'
    ],
    specifications: {
      'Frame Material': 'Aircraft-grade anodized aluminum tubing',
      'Total Net Weight': '19.5 lbs (Super transport edition)',
      'Weight Capacity': 'Standard 250 lbs | Wide 300 lbs | Bariatric 400 lbs',
      'Upholstery': 'Breathable, flame-retardant stain-resistant nylon',
      'Folded Dimensions': '28 cm x 66 cm x 77 cm',
      'Warranty': 'Lifetime Frame Warranty, 1 Year Parts'
    }
  },

  // 5. Walking Cane
  'prod-5': {
    brand: 'Carex Orthopedic Mobility Quad-Base',
    rating: 4.8,
    review_count: 112,
    angles: [
      { angle: 'front', label: 'Full Cane Profile', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800' },
      { angle: 'side', label: 'Ergonomic Grip Angle', image_url: 'https://images.unsplash.com/photo-1580281658626-ee37972c3d73?w=800' },
      { angle: 'detail', label: 'Quad Base Pivot Foot', image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800' },
      { angle: 'in_use', label: 'Senior Assisted Walking', image_url: '/images/mobility_hydration.webp' }
    ],
    colors: [
      { name: 'Royal Bronze Walnut', hex: '#78350F', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800' },
      { name: 'Midnight Jet Black', hex: '#111827', image_url: 'https://images.unsplash.com/photo-1580281658626-ee37972c3d73?w=800' },
      { name: 'Polished Sterling Silver', hex: '#94A3B8', image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800' },
      { name: 'Forest Emerald Green', hex: '#166534', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800' }
    ],
    sizes: [
      { id: 'size-cane-std', name: 'Standard Adjustable (30"-39" Height)', label: 'Standard (30"-39")', price_delta_jmd: 0, in_stock: true },
      { id: 'size-cane-petite', name: 'Petite Short (26"-34" Height)', label: 'Petite (26"-34")', price_delta_jmd: 0, in_stock: true },
      { id: 'size-cane-quad', name: 'Heavy-Duty 4-Point Self-Standing Quad Base', label: 'Self-Standing Quad Base', price_delta_jmd: 1200, in_stock: true }
    ],
    features: [
      'Self-Standing 360° All-Terrain Base: Stands independently when placed on floors so elders never have to bend down to pick up dropped canes.',
      'Soft Gel Contoured Derby Handle: Relieves wrist arthritis pressure and cushions palm impact during prolonged daily walking.',
      'Adjustable 10-Level Push Button Pin: Customizes height instantly from 30 inches to 39 inches to fit individuals from 4\'10" to 6\'4".',
      'Anti-Rattle Safety Lock: Heavy-duty metal tightening ring eliminates cane vibration and ensures quiet, rock-solid stability.'
    ],
    specifications: {
      'Shaft Material': 'Corrosion-resistant anodized extruded aluminum',
      'Weight Capacity': '300 lbs (Standard) / 450 lbs (Quad Heavy-Duty)',
      'Total Weight': 'Only 1.1 lbs',
      'Base Tip': 'Slip-resistant non-marking rubber suction foot'
    }
  },

  // 6. Adult Diapers
  'prod-6': {
    brand: 'DryComfort Hospital Maximum Absorbency',
    rating: 4.8,
    review_count: 165,
    angles: [
      { angle: 'front', label: 'Package Front (20ct)', image_url: '/images/diapers.webp' },
      { angle: 'side', label: 'Contoured Elastic Side Leaks', image_url: '/images/diapers.jpg' },
      { angle: 'detail', label: 'Wetness Indicator Strip', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
      { angle: 'in_use', label: 'Comfort Fit Demonstration', image_url: '/images/elderly_vitals.webp' }
    ],
    colors: [
      { name: 'Clinical Pure White', hex: '#FFFFFF', image_url: '/images/diapers.webp' },
      { name: 'Soft Comfort Blue', hex: '#BFDBFE', image_url: '/images/diapers.jpg' }
    ],
    sizes: [
      { id: 'size-diaper-m', name: 'Medium (Waist 32"-44" / 20 Pack)', label: 'Medium (32"-44")', price_delta_jmd: 0, in_stock: true },
      { id: 'size-diaper-l', name: 'Large (Waist 45"-58" / 20 Pack)', label: 'Large (45"-58")', price_delta_jmd: 0, in_stock: true },
      { id: 'size-diaper-xl', name: 'Extra Large (XL Waist 59"-66" / 20 Pack)', label: 'XL (59"-66")', price_delta_jmd: 400, in_stock: true },
      { id: 'size-diaper-bulk', name: 'Value Bundle Case (3 Packs / 60 Briefs)', label: 'Value Case (60 ct)', price_delta_jmd: 7200, in_stock: true }
    ],
    features: [
      '12-Hour Overnight Leak Lock Core: Super-absorbent polymer locks moisture away within seconds, keeping delicate skin dry and rash-free.',
      'Wetness Indicator Line: Color-changing stripe transforms from yellow to blue to alert caregivers when a change is needed without disturbing the patient.',
      'Dual Leak Guard Barriers: 3D standing leg cuffs prevent side leakage for restless sleepers and side-sleepers.',
      'Refastenable Hook-and-Loop Tapes: Fasten and unfasten multiple times for quick inspection without tearing the outer breathable backing.'
    ],
    specifications: {
      'Absorbency Level': 'Maximum Overnight (Up to 2,500 ml)',
      'Pack Count': '20 briefs per pack',
      'Odor Protection': 'Activated OdorLock neutralizing core',
      'Skin Safety': 'Hypoallergenic, chlorine-free, fragrance-free'
    }
  },

  // 7. Hand Sanitizer 500ml
  'prod-7': {
    brand: 'PureClean 75% Ethyl Alcohol Clinical Defense',
    rating: 4.9,
    review_count: 88,
    angles: [
      { angle: 'front', label: '500ml Pump Bottle', image_url: '/images/hand_sanitizer.webp' },
      { angle: 'side', label: 'Dispenser Nozzle Angle', image_url: '/images/hand_sanitizer.jpg' },
      { angle: 'detail', label: 'Aloe Vera Moisturizing Gel', image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800' }
    ],
    colors: [
      { name: 'Crystal Clear Gel', hex: '#E0F2FE', image_url: '/images/hand_sanitizer.webp' },
      { name: 'Aloe Vera Infused Green', hex: '#DCFCE7', image_url: '/images/hand_sanitizer.jpg' }
    ],
    sizes: [
      { id: 'size-sanit-500', name: '500ml Pump Dispenser Bottle', label: '500ml Pump Bottle', price_delta_jmd: 0, in_stock: true },
      { id: 'size-sanit-travel', name: 'Pocket Travel Flip-Top 3-Pack (100ml x 3)', label: 'Travel 3-Pack (100ml)', price_delta_jmd: 300, in_stock: true },
      { id: 'size-sanit-gallon', name: '1-Gallon Clinic Refill Jug (3.8 Liters)', label: '1-Gallon Jug (3.8L)', price_delta_jmd: 3200, in_stock: true }
    ],
    features: [
      '75% USP Grade Ethyl Alcohol: Kills 99.99% of hospital bacteria, viruses, and pathogens in 15 seconds.',
      'Moisturizing Aloe Vera & Vitamin E: Prevents skin dryness and cracked hands even with frequent sanitizing during multiple nursing visits.',
      'Quick-Drying Residue-Free Formula: Leaves zero sticky film or heavy chemical perfume smell.',
      'Smooth Lockable Pump Dispenser: Easy one-hand dispensing on bedside tables or medication carts.'
    ],
    specifications: {
      'Active Ingredient': 'Ethyl Alcohol 75% v/v (USP Standard)',
      'Volume': '500 ml / 16.9 fl oz',
      'Format': 'Clear Viscous Gel',
      'Certifications': 'MOHW Jamaica Sanitary Standards Compliant'
    }
  },

  // 8. Digital Thermometer
  'prod-8': {
    brand: 'ThermoScan Non-Contact Infrared Pro',
    rating: 4.8,
    review_count: 130,
    angles: [
      { angle: 'front', label: 'Infrared Sensor & Display', image_url: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=800' },
      { angle: 'side', label: 'Ergonomic Pistol Grip', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
      { angle: 'detail', label: 'Tricolor Fever Alarm LCD', image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800' }
    ],
    colors: [
      { name: 'Medical Arctic White', hex: '#F8FAFC', image_url: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=800' },
      { name: 'Cyan Blue Trim', hex: '#38BDF8', image_url: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=800' }
    ],
    sizes: [
      { id: 'size-therm-std', name: 'Clinical Handheld Forehead Scanner', label: 'Handheld Scanner', price_delta_jmd: 0, in_stock: true },
      { id: 'size-therm-pro', name: 'Pro Kit (Scanner + Wall Mount Bracket + 2 Batteries)', label: 'Pro Wall & Mount Kit', price_delta_jmd: 1800, in_stock: true }
    ],
    features: [
      '1-Second Instant Reading: Non-contact infrared sensor measures forehead temperature from 1 to 5 cm away without waking sleeping patients.',
      'Tricolor Backlit Fever Warning: Green (Normal 36.5-37.3°C), Orange (Low Fever), Red with Beep (High Fever).',
      'Dual Mode for Body & Objects: Switch easily between patient body temperature and infant milk bottle, bathwater, or room temperature.',
      '32-Memory Recall: Automatically stores the last 32 readings to monitor fever trends throughout day and night shifts.'
    ],
    specifications: {
      'Measurement Distance': '1 to 5 cm non-contact',
      'Measuring Time': '≤ 1.0 second',
      'Accuracy': '±0.2°C (35.0°C - 42.0°C)',
      'Power': '2 x AAA Alkaline Batteries (included)',
      'Display Units': 'Switchable Celsius (°C) / Fahrenheit (°F)'
    }
  },

  // 9. Bedside Commode
  'prod-9': {
    brand: 'Carex 3-in-1 Heavy-Duty Bedside Commode',
    rating: 4.9,
    review_count: 64,
    angles: [
      { angle: 'front', label: 'Full Chair Assembly', image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800' },
      { angle: 'side', label: 'Removable Splash Guard & Bucket', image_url: 'https://images.unsplash.com/photo-1580281658626-ee37972c3d73?w=800' },
      { angle: 'detail', label: 'Push-Button Height Legs', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800' }
    ],
    colors: [
      { name: 'Platinum Grey Frame', hex: '#64748B', image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800' },
      { name: 'Hospital Cream White', hex: '#F1F5F9', image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800' }
    ],
    sizes: [
      { id: 'size-commode-std', name: 'Standard 350-lb Capacity Steel Frame', label: 'Standard (350 lbs)', price_delta_jmd: 0, in_stock: true },
      { id: 'size-commode-bari', name: 'Bariatric Extra-Wide 500-lb Heavy-Duty Frame', label: 'Bariatric Extra-Wide (500 lbs)', price_delta_jmd: 4500, in_stock: true }
    ],
    features: [
      '3-in-1 Versatile Design: Use as standalone bedside commode, over-toilet safety support frame, or raised toilet seat.',
      'Complete Accessory Set Included: 7.5-quart commode bucket with carry handle, splash shield, and tight lid for odor containment.',
      'Tool-Free Easy Assembly: Snaps together in less than 5 minutes with push-pin buttons.',
      'Non-Skid Suction Rubber Feet: Extra-wide rubber cups grip bathroom tiles and hardwood securely without slipping.'
    ],
    specifications: {
      'Frame Material': 'Corrosion-resistant powder-coated welded steel',
      'Weight Capacity': '350 lbs (Standard) / 500 lbs (Bariatric)',
      'Seat Height Adjustment': '16" to 22" (in 1-inch increments)',
      'Seat Width Between Arms': '19.5 inches'
    }
  },

  // 10. Compression Socks
  'prod-10': {
    brand: 'VenoCare Graduated Medical Compression (20-30 mmHg)',
    rating: 4.8,
    review_count: 94,
    angles: [
      { angle: 'front', label: 'Pair Profile', image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800' },
      { angle: 'side', label: 'Calf & Arch Support Angle', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
      { angle: 'detail', label: 'Seamless Toe & Weave Texture', image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800' }
    ],
    colors: [
      { name: 'Nude / Natural Tan', hex: '#D4A373', image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800' },
      { name: 'Midnight Black', hex: '#0F172A', image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800' },
      { name: 'Clinical Pure White', hex: '#F8FAFC', image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800' },
      { name: 'Navy Blue', hex: '#1E3A8A', image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800' }
    ],
    sizes: [
      { id: 'size-sock-sm', name: 'Small / Medium (Calf 11"-15" / Shoe 5-9)', label: 'S / M (Calf 11"-15")', price_delta_jmd: 0, in_stock: true },
      { id: 'size-sock-lxl', name: 'Large / X-Large (Calf 15"-19" / Shoe 8-12)', label: 'L / XL (Calf 15"-19")', price_delta_jmd: 0, in_stock: true },
      { id: 'size-sock-xxl', name: 'XXL Wide Calf (Calf 19"-23")', label: 'XXL Plus Wide Calf', price_delta_jmd: 400, in_stock: true }
    ],
    features: [
      'True 20-30 mmHg Medical Graduated Compression: Tightest at the ankle and gently decreasing up the calf to stimulate venous blood flow.',
      'Reduces Swelling & Deep Vein Thrombosis (DVT): Essential for bedbound patients, post-surgery recovery, and elderly individuals prone to edema.',
      'Breathable Moisture-Wicking Fiber: 85% Nylon, 15% Spandex keeps legs cool and dry in Jamaican climate without overheating.',
      'Non-Binding Top Band: Stay-up wide elastic cuff prevents pinching or cutting off circulation below the knee.'
    ],
    specifications: {
      'Compression Rating': '20-30 mmHg (Class II Medical)',
      'Material': '85% Polyamide Nylon, 15% Elastane Spandex',
      'Toe Style': 'Closed Toe with reinforced heel pocket'
    }
  },

  // 11. Wound Dressing Pack
  'prod-11': {
    brand: 'SurgiSafe Sterile Wound Care Complete System',
    rating: 4.9,
    review_count: 145,
    angles: [
      { angle: 'front', label: 'Sterile Pack Sealed View', image_url: '/images/gauze_dressing.webp' },
      { angle: 'side', label: 'Waterproof Bordered Dressing', image_url: '/images/wound_dressing.webp' },
      { angle: 'detail', label: 'Absorbent Hydrogel Core & Tape', image_url: '/images/medical_tape.webp' },
      { angle: 'in_use', label: 'Post-Surgical Application', image_url: '/images/wound_dressing.jpg' }
    ],
    colors: [
      { name: 'Sterile Clinical White', hex: '#F8FAFC', image_url: '/images/gauze_dressing.webp' }
    ],
    sizes: [
      { id: 'size-wound-std', name: 'Standard Pack (5x Sterile 4x4 Pads + Tape + Iodine)', label: 'Standard Pack (5 Pads)', price_delta_jmd: 0, in_stock: true },
      { id: 'size-wound-box', name: 'Post-Op 2-Week Care Box (20 Sterile Dressings + Hydrogel)', label: '2-Week Box (20 Dressings)', price_delta_jmd: 1800, in_stock: true },
      { id: 'size-wound-waterproof', name: 'Bordered Waterproof Island Dressing 10-Pack', label: 'Bordered Waterproof (10 ct)', price_delta_jmd: 950, in_stock: true }
    ],
    features: [
      'Hospital Sterility Guaranteed: Individually peel-packed sterile 4"x4" 8-ply cotton gauze compresses for infection-free dressing changes.',
      'Non-Adherent Wound Contact Layer: Cushions incisions and ulcers without sticking to granulating healing tissue, preventing pain during removals.',
      'High-Absorption Fluid Core: Rapidly wicks exudate away from skin to prevent wound maceration.',
      'Includes Medical Micropore Tape: Gentle hypoallergenic adhesive paper tape suitable for fragile elderly skin.'
    ],
    specifications: {
      'Sterility': 'Gamma Radiation Sterilized, Single Use',
      'Material': '100% Bleached USP Surgical Grade Cotton',
      'Latex Status': 'Latex-Free'
    }
  },

  // 12. Pill Organizer
  'prod-12': {
    brand: 'MedMinder Weekly 4-Times-a-Day Pill Dispenser',
    rating: 4.8,
    review_count: 82,
    angles: [
      { angle: 'front', label: 'Open 7-Day Tray View', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
      { angle: 'side', label: 'Individual Daily Pop-Out Pods', image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800' },
      { angle: 'detail', label: 'Bold AM/PM Print & Braille', image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800' }
    ],
    colors: [
      { name: 'Vibrant Rainbow Day-by-Day', hex: '#3B82F6', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
      { name: 'Translucent Frosted Ice', hex: '#CBD5E1', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
      { name: 'Executive Smokey Charcoal', hex: '#334155', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' }
    ],
    sizes: [
      { id: 'size-pill-7day', name: '7-Day 4-Compartment (Morning, Noon, Eve, Bed)', label: '7-Day (4 Times/Day)', price_delta_jmd: 0, in_stock: true },
      { id: 'size-pill-xl', name: 'Extra-Deep XL Compartment (For Large Fish Oil & Multi-Vitamins)', label: 'XL Deep Pods', price_delta_jmd: 400, in_stock: true },
      { id: 'size-pill-14day', name: '14-Day 2-Week Traveler Edition', label: '14-Day Bi-Weekly', price_delta_jmd: 700, in_stock: true }
    ],
    features: [
      'Removable Daily Compartments: Take just one day\'s medications in your pocket or purse when visiting family or going to church.',
      'Oversized Bold Silk-Screened Print: Easy-to-read Morning, Noon, Evening, and Night labels that will not rub off with daily handling.',
      'Moisture-Proof Double Snap Lock: Prevents spills if dropped and protects pills from Caribbean humidity.',
      'Food-Grade BPA-Free Plastic: 100% safe for prescription pills, cardiac medication, and nutritional supplements.'
    ],
    specifications: {
      'Material': 'BPA-Free Food Grade Polypropylene (PP)',
      'Compartments': '28 total compartments (7 days x 4 times)',
      'Dimensions': '21.5 cm x 12.5 cm x 2.8 cm'
    }
  }
};

/**
 * Generates dynamic fallback Amazon-style product data for any product
 * that does not have a static predefined profile.
 */
export function enhanceProductWithAmazonDetails(product: MedicalSupplyItem | StoreProduct): MedicalSupplyItem {
  const profile = PRODUCT_PROFILES[product.id];
  const primaryImg = product.image_url || '/images/first_aid_kit.webp';
  const stockVal = 'stock' in product ? product.stock : (product as StoreProduct).stock_qty ?? 10;

  const baseItem: MedicalSupplyItem = {
    id: product.id,
    name: product.name,
    price_jmd: product.price_jmd,
    category: product.category,
    stock: stockVal,
    stock_quantity: stockVal,
    description: product.description,
    image_url: primaryImg,
    is_active: product.is_active !== undefined ? product.is_active : true
  };

  if (profile) {
    return {
      ...baseItem,
      brand: profile.brand,
      rating: profile.rating,
      review_count: profile.review_count,
      angles: profile.angles,
      colors: profile.colors,
      sizes: profile.sizes,
      features: profile.features,
      specifications: profile.specifications
    };
  }

  // Dynamic profile based on category and name
  const cat = (product.category || '').toLowerCase();

  const defaultAngles: ProductAngleImage[] = [
    { angle: 'front', label: 'Front Packaging', image_url: primaryImg },
    { angle: 'side', label: 'Angled Perspective', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
    { angle: 'detail', label: 'Clinical Seal Detail', image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800' },
    { angle: 'in_use', label: 'Home Care Usage', image_url: '/images/elderly_vitals.webp' }
  ];

  const defaultColors: ProductColorOption[] = cat.includes('equip') || cat.includes('mobil') ? [
    { name: 'Hospital Navy', hex: '#1E3A8A' },
    { name: 'Arctic White', hex: '#F8FAFC' },
    { name: 'Charcoal Black', hex: '#0F172A' }
  ] : [
    { name: 'Clinical Standard', hex: '#0284C7' },
    { name: 'Pure White', hex: '#FFFFFF' }
  ];

  const defaultSizes: ProductSizeOption[] = [
    { id: 'size-opt-std', name: 'Standard Unit', label: 'Standard Unit', price_delta_jmd: 0, in_stock: true },
    { id: 'size-opt-family', name: 'Family Value Bundle', label: 'Value Bundle', price_delta_jmd: Math.round(product.price_jmd * 0.8), in_stock: true },
    { id: 'size-opt-clinic', name: 'Bulk Clinic Pack', label: 'Bulk Clinic Pack', price_delta_jmd: Math.round(product.price_jmd * 2.5), in_stock: true }
  ];

  const defaultFeatures = [
    `Hospital-Grade Standards: Certified for home health care and patient comfort in Jamaica.`,
    `Sanitized & Sealed: Delivered in tamper-evident clinical packaging from Kingston inventory.`,
    `Caregiver Approved: Designed for easy family handling, high reliability, and clear operation.`,
    `Fast Courier Dispatch: Shipped islandwide via ZipMail or Knutsford Express with local warranty.`
  ];

  const defaultSpecs: Record<string, string> = {
    'Category': product.category || 'Clinical Supplies',
    'Origin / Dispatch': 'Kingston Central Medical Supply Hub, Jamaica',
    'Standard': 'MOHW Jamaica Compliant Hospital Standard',
    'Availability': `${stockVal} Units in Stock`,
    'Warranty': '30-Day Defect Replacement Guarantee'
  };

  return {
    ...baseItem,
    brand: 'WeCare Jamaica Medical Supply Hub',
    rating: 4.8,
    review_count: 48,
    angles: defaultAngles,
    colors: defaultColors,
    sizes: defaultSizes,
    features: defaultFeatures,
    specifications: defaultSpecs
  };
}
