// Seed catalogue. PLACEHOLDER prices — replace with real base prices (README → Before launch).
// Used to bootstrap the local demo store and to generate supabase/seed.sql.
import { site } from "@/config/site";
import type {
  AddonGroup,
  AddonOption,
  AddonRule,
  Design,
  DesignRegion,
  Fabric,
  PaletteColor,
  Settings,
  SizeOption,
} from "@/lib/types";

const id = (prefix: string, key: string) => `${prefix}_${key}`;

// ── Palette ─────────────────────────────────────────────────────────────
const paletteRaw: [string, string, string][] = [
  ["deep-green", "Deep Green", "#1F4D40"],
  ["sage", "Sage", "#A9BFA8"],
  ["mint", "Mint", "#CFE3D6"],
  ["aqua", "Aqua", "#9ED9D2"],
  ["sky", "Sky Blue", "#A8C8E8"],
  ["navy", "Navy", "#1F2A4A"],
  ["royal-blue", "Royal Blue", "#1D3FA6"],
  ["teal", "Teal", "#1E9E95"],
  ["emerald", "Emerald", "#0B6B4B"],
  ["purple", "Purple", "#6A2BB8"],
  ["blush", "Blush", "#EFC8C4"],
  ["dusty-rose", "Dusty Rose", "#D9A5A0"],
  ["rose-pink", "Rose Pink", "#E2A3B5"],
  ["aries-pink", "Aries Pink", "#FA90C9"],
  ["bubblegum", "Bubblegum", "#F960B8"],
  ["hot-pink", "Hot Pink", "#CE117D"],
  ["orchid", "Orchid", "#880651"],
  ["mulberry", "Mulberry", "#520630"],
  ["lilac", "Lilac", "#C9B3D6"],
  ["lavender", "Lavender", "#B3AFD0"],
  ["mauve", "Mauve", "#9C7A97"],
  ["plum", "Plum", "#4A1F3D"],
  ["maroon", "Maroon", "#6E1423"],
  ["red", "Red", "#B22234"],
  ["terracotta", "Terracotta", "#C66B4E"],
  ["mustard", "Mustard", "#D9A441"],
  ["gold", "Gold", "#C9A66B"],
  ["champagne", "Champagne", "#E6D5B3"],
  ["silver", "Silver", "#C9CBCF"],
  ["ivory", "Ivory", "#F4EEE2"],
  ["cream", "Cream", "#EDE3CF"],
  ["white", "White", "#FFFFFF"],
  ["beige", "Beige", "#D8C3A5"],
  ["cocoa", "Cocoa", "#5A3A26"],
  ["grey", "Grey", "#9AA0A6"],
  ["black", "Black", "#151515"],
];
export const palette: PaletteColor[] = paletteRaw.map(([key, name, hex], i) => ({
  id: id("col", key),
  key,
  name,
  hex,
  sort: i,
  active: true,
}));

// ── Fabrics ─────────────────────────────────────────────────────────────
const earthy = ["ivory", "cream", "beige", "cocoa", "maroon", "sage", "deep-green", "navy", "terracotta", "dusty-rose", "sky", "white", "black", "mustard", "grey", "blush", "lilac"];
const fabricRaw: [string, string, string, number, string[] | null][] = [
  ["cotton", "Cotton", "Breathable, everyday comfort. Best for day wear and kids.", 0, null],
  ["linen", "Linen", "Cool and textured with a natural crease. Earthy tones only.", 1500, earthy],
  ["crepe", "Crepe", "Fluid drape with a soft matte finish. Very forgiving fit.", 1000, null],
  ["jersey", "Stretch jersey", "Body-skimming stretch for column and bodycon styles.", 800, null],
  ["satin", "Satin", "Smooth with a soft sheen. Our most popular occasion fabric.", 2500, null],
  ["tulle", "Soft tulle", "Layered net over a satin base for volume and float.", 2000, null],
  ["chiffon", "Chiffon", "Light, floaty and sheer, lined underneath. Drapes beautifully.", 1800, null],
  ["organza", "Organza", "Crisp, sheer and airy. Holds a full skirt shape.", 2200, null],
  ["silk-blend", "Silk blend", "Luxurious lustre and drape for special occasions.", 5500, null],
  ["sequin-net", "Sequin net", "Hand-finished sequins on net. Limited colours.", 9000, ["black", "navy", "maroon", "deep-green", "mauve", "blush", "gold", "ivory", "aqua", "silver", "champagne", "emerald", "royal-blue"]],
  ["brocade", "Brocade", "Woven pattern with metallic thread, ideal for blouses.", 4500, ["deep-green", "maroon", "navy", "gold", "plum", "red", "mustard", "ivory"]],
  ["crochet-cotton", "Crochet cotton yarn", "Hand-crocheted in cotton yarn by our designer.", 0, ["ivory", "cream", "white", "sage", "mint", "dusty-rose", "blush", "lilac", "mustard", "sky", "terracotta", "black", "cocoa"]],
];
export const fabrics: Fabric[] = fabricRaw.map(([key, name, note, price_modifier, available_colors], i) => ({
  id: id("fab", key),
  key,
  name,
  note,
  price_modifier,
  available_colors,
  sort: i,
  active: true,
}));

// ── Add-on groups & options ───────────────────────────────────────────────
const groupRaw: [string, string, string, "single" | "multi"][] = [
  ["neckline", "Neckline", "Change the neckline shape.", "single"],
  ["sleeves", "Sleeves", "Add or change sleeves.", "single"],
  ["length", "Length", "Shorten, lengthen or add a train.", "single"],
  ["back", "Back style", "How the back closes.", "single"],
  ["waist", "Waist", "Define the waist.", "single"],
  ["lining", "Lining", "Lining is priced per metre of fabric.", "single"],
  ["embroidery", "Embroidery & trims", "Hand-finished details. Choose any.", "multi"],
  ["buttons", "Buttons", "Front button detail.", "single"],
  ["detail", "Bows, flowers & layers", "Statement details. Choose any.", "multi"],
  ["pockets", "Pockets", "Because every dress deserves pockets.", "single"],
];
export const addonGroups: AddonGroup[] = groupRaw.map(([key, name, description, selection], i) => ({
  id: id("grp", key),
  key,
  name,
  description,
  selection,
  sort: i,
}));

// [group, key, name, price, (legacy preview hint, unused), description?, price type?]
type OptRow = [string, string, string, number, unknown, string?, ("fixed" | "per_metre")?];
const optionRaw: OptRow[] = [
  // neckline
  ["neckline", "neck-design", "As designed", 0, null],
  ["neckline", "neck-sweetheart", "Sweetheart with straps", 0, { slot: "bodice", variant: "sweetheart" }],
  ["neckline", "neck-strapless", "Strapless", 0, { slot: "bodice", variant: "strapless" }],
  ["neckline", "neck-v", "V-neck", 0, { slot: "bodice", variant: "v-neck" }],
  ["neckline", "neck-scoop", "Scoop", 0, { slot: "bodice", variant: "scoop" }],
  ["neckline", "neck-square", "Square", 500, { slot: "bodice", variant: "square" }],
  ["neckline", "neck-boat", "Boat neck", 0, { slot: "bodice", variant: "boat" }],
  ["neckline", "neck-halter", "Halter", 800, { slot: "bodice", variant: "halter" }],
  ["neckline", "neck-one-shoulder", "One shoulder", 1200, { slot: "bodice", variant: "one-shoulder" }],
  ["neckline", "neck-off-shoulder", "Off-shoulder", 1200, { slot: "bodice", variant: "off-shoulder" }],
  // sleeves
  ["sleeves", "sleeves-none", "Sleeveless", 0, { slot: "sleeves", variant: "none" }],
  ["sleeves", "sleeves-cap", "Cap sleeves", 800, { slot: "sleeves", variant: "cap" }],
  ["sleeves", "sleeves-puff", "Puff sleeves", 1800, { slot: "sleeves", variant: "puff" }],
  ["sleeves", "sleeves-elbow", "Elbow sleeves", 1500, { slot: "sleeves", variant: "elbow" }],
  ["sleeves", "sleeves-long", "Long sleeves", 2200, { slot: "sleeves", variant: "long" }],
  ["sleeves", "sleeves-sheer", "Sheer tulle sleeves", 2500, { slot: "sleeves", variant: "sheer" }],
  // length
  ["length", "len-design", "As designed", 0, null],
  ["length", "len-mini", "Mini", -1500, { slot: "length", variant: "mini" }],
  ["length", "len-knee", "Knee length", -1000, { slot: "length", variant: "knee" }],
  ["length", "len-midi", "Midi", -500, { slot: "length", variant: "midi" }],
  ["length", "len-floor", "Floor length", 1000, { slot: "length", variant: "floor" }],
  ["length", "len-train", "Floor length with sweep train", 3500, { slot: "length", variant: "train" }],
  // back
  ["back", "back-zip", "Concealed zip", 0, null],
  ["back", "back-corset", "Corset lace-up", 1500, null],
  ["back", "back-open", "Open low back", 1000, null],
  ["back", "back-buttons", "Covered button back", 1200, null],
  // waist
  ["waist", "waist-none", "No waist detail", 0, null],
  ["waist", "waist-belt", "Self belt with gold buckle", 900, { slot: "extra", variant: "belt", region_key: "accent" }],
  ["waist", "waist-sash", "Satin sash with drape", 1500, { slot: "extra", variant: "sash-drape", region_key: "accent" }],
  ["waist", "waist-peplum", "Peplum", 2200, { slot: "extra", variant: "peplum", region_key: "main" }],
  // lining (per metre)
  ["lining", "lining-none", "Unlined", 0, null],
  ["lining", "lining-half", "Half lining", 250, null, "Bodice and upper skirt lined.", "per_metre"],
  ["lining", "lining-full", "Full lining", 450, null, "Fully lined for comfort and opacity.", "per_metre"],
  // embroidery
  ["embroidery", "emb-lace-trim", "Lace hem trim", 2500, { slot: "extra", variant: "hem-lace", region_key: "accent" }],
  ["embroidery", "emb-crochet-edge", "Hand-crocheted hem edge", 3000, { slot: "extra", variant: "crochet-hem", region_key: "accent" }, "Crocheted by our designer."],
  ["embroidery", "emb-hand", "Hand embroidery on bodice", 6500, { slot: "extra", variant: "embroidery", region_key: "accent" }],
  ["embroidery", "emb-beadwork", "Bodice beadwork", 8500, { slot: "extra", variant: "beads", region_key: "accent" }],
  ["embroidery", "emb-sequin", "Sequin scatter", 4500, { slot: "extra", variant: "sparkle", region_key: "main" }],
  // buttons
  ["buttons", "btn-none", "No front buttons", 0, null],
  ["buttons", "btn-covered", "Fabric-covered buttons", 1200, { slot: "extra", variant: "buttons", region_key: "accent" }],
  ["buttons", "btn-pearl", "Pearl buttons", 1500, { slot: "extra", variant: "buttons", region_key: "accent" }],
  // details
  ["detail", "det-bow", "Waist bow", 1200, { slot: "extra", variant: "bow", region_key: "accent" }],
  ["detail", "det-flower", "3D fabric flower", 2500, { slot: "extra", variant: "flower-3d", region_key: "accent" }],
  ["detail", "det-leaves", "Leaf appliqué cascade", 4500, { slot: "extra", variant: "leaves", region_key: "accent" }],
  ["detail", "det-cape", "Sheer shoulder cape", 5500, { slot: "extra", variant: "cape", region_key: "overlay|accent" }],
  ["detail", "det-stole", "Tulle stole", 2500, { slot: "extra", variant: "stole", region_key: "overlay|accent" }],
  ["detail", "det-overlay", "Tulle overskirt", 6000, { slot: "extra", variant: "overlay-skirt", region_key: "overlay|accent" }],
  // pockets
  ["pockets", "pockets-none", "No pockets", 0, null],
  ["pockets", "pockets-side", "Side seam pockets", 900, { slot: "extra", variant: "pockets", region_key: "main" }],
];
export const addonOptions: AddonOption[] = optionRaw.map(([group_key, key, name, price, , description = "", price_type = "fixed"], i) => ({
  id: id("opt", key),
  key,
  group_key,
  name,
  description,
  price,
  price_type,
  image_url: null,
  sort: i,
  active: true,
}));

const ruleRaw: [string, string, string][] = [
  ["neck-off-shoulder", "sleeves-long", "Off-shoulder necklines can't take long sleeves — try puff or sheer sleeves."],
  ["neck-off-shoulder", "sleeves-elbow", "Off-shoulder necklines can't take elbow sleeves — try puff or sheer sleeves."],
  ["neck-off-shoulder", "sleeves-cap", "Off-shoulder already sits on the arm, so cap sleeves aren't possible."],
  ["neck-halter", "sleeves-cap", "Halter necklines are sleeveless."],
  ["neck-halter", "sleeves-puff", "Halter necklines are sleeveless."],
  ["neck-halter", "sleeves-elbow", "Halter necklines are sleeveless."],
  ["neck-halter", "sleeves-long", "Halter necklines are sleeveless."],
  ["neck-halter", "sleeves-sheer", "Halter necklines are sleeveless."],
  ["neck-strapless", "sleeves-cap", "Strapless bodices can't hold cap sleeves."],
  ["neck-one-shoulder", "sleeves-puff", "One-shoulder styles look unbalanced with puff sleeves."],
  ["det-cape", "sleeves-puff", "A cape sits over the shoulder, so puff sleeves would crush under it."],
  ["det-cape", "det-stole", "Pick either a cape or a stole."],
  ["det-bow", "waist-belt", "Choose either a bow or a belt at the waist."],
  ["det-bow", "waist-sash", "The sash already ties at the waist — choose one."],
  ["emb-beadwork", "emb-sequin", "Beadwork and sequin scatter compete — choose one."],
  ["emb-hand", "emb-beadwork", "Choose either hand embroidery or beadwork on the bodice."],
  ["len-mini", "det-overlay", "A tulle overskirt needs a longer base length."],
  ["back-open", "back-corset", "An open back can't also be laced."],
];
export const addonRules: AddonRule[] = ruleRaw.map(([option_a, option_b, reason], i) => ({ id: `rule_${i + 1}`, option_a, option_b, reason }));

// How we get the customer's measurements (there are no S/M/L price tiers;
// customers who can't visit pick a size from /size-guide or send their own).
export const sizes: SizeOption[] = [
  ["studio", "Measure me at the studio", 0, "We take your measurements at your appointment in Kotte."],
  ["on-file", "I've been measured before", 0, "We keep your measurements on file, so there's no need to come in again."],
  ["own", "I'll send my measurements", 0, "Can't visit? Pick your size from the chart or enter your measurements."],
].map(([key, label, modifier, note], i) => ({ id: `size_${key}`, key: key as string, label: label as string, modifier: modifier as number, note: note as string, sort: i }));

export const settings: Settings = {
  range_percent: 8,
  custom_color_fee: 0, // colours never cost extra
  // Most pieces take 1 to 3 weeks; dates sooner than a week are a rush
  standard_lead_days: 7,
  rush_min_days: 3,
  rush_fee_percent: 20, // shown nowhere on the site; rush charges are agreed in the quotation
  advance_percent: 50,
  quote_valid_days: 7,
  weekly_capacity: 6,
  max_quantity: 20,
  bank: { ...site.bank },
  // PLACEHOLDER delivery fees
  delivery_fees: [
    { district: "Colombo", fee: 500 },
    { district: "Gampaha", fee: 750 },
    { district: "Kalutara", fee: 900 },
    { district: "Kandy", fee: 1200 },
    { district: "Galle", fee: 1200 },
    { district: "Kurunegala", fee: 1200 },
    { district: "Matara", fee: 1400 },
    { district: "Jaffna", fee: 1800 },
    { district: "Other districts", fee: 1500 },
  ],
};

// ── Designs ─────────────────────────────────────────────────────────────
interface DesignSeed {
  design: Omit<Design, "id" | "images" | "color_images" | "versions" | "sort" | "published"> & { photos?: boolean };
  regions: [string, string, string][];
}

const ALL = ["neckline", "sleeves", "length", "back", "waist", "lining", "embroidery", "buttons", "detail", "pockets"];
const photos = (slug: string) => ["front", "back", "detail", "angle"].map((v) => `/catalog/${slug}/${v}.webp`);

const designSeeds: DesignSeed[] = [
  {
    design: {
      slug: "blush-leaf-tulle-gown",
      name: "Blush Leaf Tulle Gown",
      category: "bridal",
      occasions: ["Homecoming", "Engagement", "Party"],
      description:
        "A strapless satin mini dress with a hand-sculpted leaf appliqué cascading across the bodice, a floor-length tulle overskirt, matching stole and a corset lace-up back.",
      base_price: 24500,
      fabric_metres: 4.5,
      default_fabric: "satin",
      fabric_keys: ["satin", "silk-blend", "crepe"],
      addon_groups: ["neckline", "sleeves", "back", "lining", "embroidery", "detail"],
      default_options: ["neck-design", "back-corset", "lining-full", "det-stole"],
      featured: true,
      badge: "Signature",
      photos: true,
    },
    regions: [["main", "Satin dress", "blush"], ["accent", "Leaf appliqué", "plum"], ["overlay", "Tulle overskirt", "blush"]],
  },
  {
    design: {
      slug: "noir-sequin-sash-gown",
      name: "Noir Sequin Sash Gown",
      category: "dress",
      occasions: ["Party", "Wedding"],
      description:
        "A fitted V-neck sequin gown on fine straps with a satin waistband and a sweeping side drape that becomes a train at the back. Lace-up corset back.",
      base_price: 32000,
      fabric_metres: 4,
      default_fabric: "sequin-net",
      fabric_keys: ["sequin-net", "satin", "crepe"],
      addon_groups: ["neckline", "sleeves", "length", "back", "lining", "embroidery"],
      default_options: ["neck-design", "len-design", "back-corset", "lining-full"],
      featured: true,
      badge: "New",
      photos: true,
    },
    regions: [["main", "Gown", "black"], ["accent", "Satin sash & drape", "black"]],
  },
  {
    design: {
      slug: "mauve-lace-drape-saree",
      name: "Mauve Lace Pre-Draped Saree",
      category: "saree-blouse",
      occasions: ["Wedding", "Engagement", "Festival"],
      description:
        "A ready-to-wear saree: satin flared skirt and sleeveless V-neck blouse with a floral lace drape stitched in place. No pleating, no pins.",
      base_price: 38500,
      fabric_metres: 6,
      default_fabric: "satin",
      fabric_keys: ["satin", "silk-blend", "crepe"],
      addon_groups: ["neckline", "sleeves", "back", "lining", "embroidery"],
      default_options: ["neck-design", "back-zip", "lining-full"],
      featured: true,
      badge: null,
      photos: true,
    },
    regions: [["main", "Skirt & blouse", "mauve"], ["overlay", "Lace drape", "lilac"]],
  },
  {
    design: {
      slug: "maroon-tie-back-column-dress",
      name: "Maroon Tie-Back Column Dress",
      category: "dress",
      occasions: ["Party", "Homecoming"],
      description:
        "A sleek ankle-length column dress with a soft sweetheart neckline, fine straps that cross into long ties and a dramatic open back.",
      base_price: 14500,
      fabric_metres: 3,
      default_fabric: "jersey",
      fabric_keys: ["jersey", "crepe", "satin"],
      addon_groups: ["neckline", "length", "back", "lining", "embroidery", "detail", "pockets"],
      default_options: ["neck-design", "len-design", "back-open", "lining-half"],
      featured: true,
      badge: null,
      photos: true,
    },
    regions: [["main", "Dress", "maroon"], ["accent", "Details", "gold"]],
  },
  {
    design: {
      slug: "sage-bloom-lehenga-set",
      name: "Sage Bloom Lehenga Set",
      category: "bridal",
      occasions: ["Wedding", "Engagement", "Festival"],
      description:
        "A V-neck crop blouse and flared tulle lehenga skirt covered in hand-placed 3D fabric flowers with beaded vines.",
      base_price: 58000,
      fabric_metres: 7,
      default_fabric: "tulle",
      fabric_keys: ["tulle", "satin", "silk-blend"],
      addon_groups: ["neckline", "sleeves", "back", "lining", "embroidery", "detail"],
      default_options: ["neck-design", "back-zip", "lining-full"],
      featured: true,
      badge: "Bridal",
      photos: true,
    },
    regions: [["main", "Blouse & skirt", "mint"], ["accent", "3D flowers", "sage"]],
  },
  {
    design: {
      slug: "aqua-one-shoulder-cape-gown",
      name: "Aqua One-Shoulder Cape Gown",
      category: "dress",
      occasions: ["Wedding", "Party", "Engagement"],
      description:
        "A one-shoulder satin mermaid gown with a beaded bodice, a sheer beaded lace front panel and a floor-sweeping tulle cape.",
      base_price: 42000,
      fabric_metres: 5,
      default_fabric: "satin",
      fabric_keys: ["satin", "silk-blend", "crepe"],
      addon_groups: ["neckline", "length", "back", "lining", "embroidery", "detail"],
      default_options: ["neck-design", "len-design", "back-zip", "lining-full"],
      featured: true,
      badge: null,
      photos: true,
    },
    regions: [["main", "Gown", "aqua"], ["accent", "Lace panel", "aqua"], ["overlay", "Tulle cape", "aqua"]],
  },
  {
    design: {
      slug: "cocoa-tiered-maxi-skirt-set",
      name: "Cocoa Tiered Maxi Skirt Set",
      category: "sets",
      occasions: ["Casual", "Office"],
      description:
        "A three-tier gathered maxi skirt with pockets, a fitted knit tank and a chunky hand-made cardigan. Easy, warm and made to last.",
      base_price: 12500,
      fabric_metres: 3.5,
      default_fabric: "linen",
      fabric_keys: ["linen", "cotton"],
      addon_groups: ["length", "lining", "embroidery", "pockets"],
      default_options: ["len-design", "lining-none", "pockets-side"],
      featured: true,
      badge: null,
      photos: true,
    },
    regions: [["main", "Skirt", "cocoa"], ["top", "Knit top", "ivory"], ["accent", "Cardigan", "cream"]],
  },
  {
    design: {
      slug: "little-mal-puff-sleeve-frock",
      name: "Little Mal Puff-Sleeve Frock",
      category: "kids",
      occasions: ["Kids", "Party", "Festival"],
      description: "A twirly cotton frock with puff sleeves and a waist bow. Sized for ages 2–12.",
      base_price: 7500,
      fabric_metres: 1.8,
      default_fabric: "cotton",
      fabric_keys: ["cotton", "linen", "satin", "tulle"],
      addon_groups: ["neckline", "sleeves", "length", "embroidery", "detail", "pockets", "buttons"],
      default_options: ["neck-design", "sleeves-puff", "len-design", "det-bow"],
      featured: false,
      badge: "Kids",
    },
    regions: [["main", "Frock", "dusty-rose"], ["accent", "Bow & trims", "ivory"]],
  },
  {
    design: {
      slug: "mal-crochet-crop-top",
      name: "Mal Crochet Crop Top",
      category: "crochet-top",
      occasions: ["Casual", "Festival"],
      description: "A hand-crocheted square-neck crop top with flower-motif straps, made by our designer in cotton yarn.",
      base_price: 6500,
      fabric_metres: 0.8,
      default_fabric: "crochet-cotton",
      fabric_keys: ["crochet-cotton"],
      addon_groups: ["sleeves", "detail", "buttons"],
      default_options: ["sleeves-none"],
      featured: true,
      badge: "Handmade",
    },
    regions: [["main", "Crochet yarn", "ivory"], ["accent", "Flower motif", "mustard"]],
  },
  {
    design: {
      slug: "classic-sweetheart-saree-blouse",
      name: "Classic Sweetheart Saree Blouse",
      category: "saree-blouse",
      occasions: ["Wedding", "Festival", "Office"],
      description: "A tailored sweetheart saree blouse with elbow sleeves and a gold trim. Bring your saree, we'll match it.",
      base_price: 5500,
      fabric_metres: 1,
      default_fabric: "silk-blend",
      fabric_keys: ["silk-blend", "brocade", "satin", "cotton"],
      addon_groups: ["neckline", "sleeves", "back", "embroidery", "buttons"],
      default_options: ["neck-design", "sleeves-elbow", "back-buttons"],
      featured: false,
      badge: null,
    },
    regions: [["main", "Blouse", "deep-green"], ["accent", "Trim", "gold"]],
  },
  {
    design: {
      slug: "everyday-aline-cotton-frock",
      name: "Everyday A-Line Cotton Frock",
      category: "frock",
      occasions: ["Casual", "Office"],
      description: "Our everyday frock: boat neck, cap sleeves, a self belt and an easy A-line midi skirt with pockets.",
      base_price: 8900,
      fabric_metres: 2.8,
      default_fabric: "cotton",
      fabric_keys: ["cotton", "linen", "crepe"],
      addon_groups: ALL,
      default_options: ["neck-design", "sleeves-cap", "len-design", "waist-belt", "pockets-side"],
      featured: false,
      badge: null,
    },
    regions: [["main", "Frock", "sky"], ["accent", "Belt & trims", "ivory"]],
  },
  {
    design: {
      slug: "navy-sequin-fan-party-dress",
      name: "Navy Sequin Fan Party Dress",
      category: "dress",
      occasions: ["Party", "Homecoming"],
      description:
        "A knee-length satin fit-and-flare dress with an asymmetric neckline and a bodice of hand-sewn sequin rays fanning out from the waist. Gathered full skirt, concealed back zip.",
      base_price: 18500,
      fabric_metres: 3.5,
      default_fabric: "satin",
      fabric_keys: ["satin", "silk-blend", "crepe"],
      addon_groups: ["neckline", "sleeves", "length", "back", "lining", "embroidery", "detail", "pockets"],
      default_options: ["neck-design", "len-design", "back-zip", "lining-full"],
      featured: true,
      badge: "New",
      photos: true,
    },
    regions: [["main", "Satin dress", "navy"], ["accent", "Sequin rays", "white"]],
  },
  {
    design: {
      slug: "navy-silver-peplum-drape-saree",
      name: "Navy Silver Peplum Drape Saree",
      category: "saree-blouse",
      occasions: ["Wedding", "Engagement", "Party"],
      description:
        "A pre-draped saree with a peplum front drape and silver-trimmed pallu over a column skirt embroidered with flowing silver vines. V-neck blouse with sheer puff sleeves and embroidered cuffs.",
      base_price: 42000,
      fabric_metres: 6,
      default_fabric: "crepe",
      fabric_keys: ["crepe", "silk-blend", "satin"],
      addon_groups: ["neckline", "sleeves", "back", "lining", "embroidery", "detail"],
      default_options: ["neck-design", "sleeves-puff", "back-zip", "lining-full"],
      featured: true,
      badge: "New",
      photos: true,
    },
    regions: [["main", "Saree & blouse", "navy"], ["accent", "Silver embroidery", "silver"]],
  },
  {
    design: {
      slug: "champagne-lace-high-neck-saree",
      name: "Champagne Lace High-Neck Saree",
      category: "bridal",
      occasions: ["Wedding", "Engagement"],
      description:
        "A soft net saree covered in gold-thread floral embroidery with a scalloped lace border, worn with a sleeveless high-neck sheer lace blouse.",
      base_price: 46000,
      fabric_metres: 6.5,
      default_fabric: "tulle",
      fabric_keys: ["tulle", "silk-blend", "satin"],
      addon_groups: ["neckline", "sleeves", "back", "lining", "embroidery", "buttons"],
      default_options: ["neck-design", "sleeves-none", "back-buttons", "lining-half"],
      featured: true,
      badge: "Bridal",
      photos: true,
    },
    regions: [["main", "Net saree & blouse", "champagne"], ["overlay", "Lace drape", "champagne"]],
  },
  {
    design: {
      slug: "cocoa-linen-peplum-top",
      name: "Cocoa Linen Peplum Top",
      category: "sets",
      occasions: ["Office", "Casual"],
      description:
        "A sleeveless boat-neck linen top with a fitted bodice and a box-pleated peplum. Back zip. Lovely with wide-leg trousers — ask us to make a matching pair.",
      base_price: 6900,
      fabric_metres: 1.4,
      default_fabric: "linen",
      fabric_keys: ["linen", "cotton", "crepe"],
      addon_groups: ["neckline", "sleeves", "lining", "embroidery", "buttons"],
      default_options: ["neck-design", "sleeves-none", "lining-none"],
      featured: false,
      badge: null,
      photos: true,
    },
    regions: [["main", "Top", "cocoa"], ["accent", "Details", "ivory"]],
  },
  {
    design: {
      slug: "botanical-bow-shoulder-mini",
      name: "Botanical Bow-Shoulder Mini",
      category: "dress",
      occasions: ["Casual", "Party"],
      description:
        "A one-shoulder A-line mini in botanical-print linen with a long tie that knots into a bow at the open shoulder.",
      base_price: 9800,
      fabric_metres: 2,
      default_fabric: "linen",
      fabric_keys: ["linen", "cotton"],
      addon_groups: ["length", "lining", "embroidery", "detail", "pockets"],
      default_options: ["len-design", "lining-half"],
      featured: true,
      badge: null,
      photos: true,
    },
    regions: [["main", "Print base", "beige"], ["accent", "Botanical print", "deep-green"]],
  },
  {
    design: {
      slug: "lilac-ruffle-saree",
      name: "Lilac Ruffle Saree",
      category: "saree-blouse",
      occasions: ["Wedding", "Festival", "Office"],
      description:
        "A soft textured saree edged with frills along the pallu and hem, paired with a long-sleeve sheer lace blouse in a deeper lilac.",
      base_price: 28500,
      fabric_metres: 6,
      default_fabric: "cotton",
      fabric_keys: ["cotton", "crepe", "silk-blend"],
      addon_groups: ["neckline", "sleeves", "back", "lining", "embroidery"],
      default_options: ["neck-design", "sleeves-long", "back-zip", "lining-half"],
      featured: false,
      badge: null,
      photos: true,
    },
    regions: [["blouse", "Lace blouse", "mauve"], ["main", "Saree", "lilac"]],
  },
  {
    design: {
      slug: "satin-halter-a-line-gown",
      name: "Satin Halter A-Line Gown",
      category: "dress",
      occasions: ["Wedding", "Party", "Engagement"],
      description:
        "A floor-length satin gown with a sweetheart halter neckline, fitted bodice and a fluid A-line skirt. Shown in wine, champagne, sage and navy.",
      base_price: 19500,
      fabric_metres: 5,
      default_fabric: "satin",
      fabric_keys: ["satin", "silk-blend", "crepe"],
      addon_groups: ["length", "back", "lining", "pockets"],
      default_options: ["len-design", "back-zip", "lining-full"],
      featured: true,
      badge: "4 colours",
    },
    regions: [["main", "Satin", "maroon"]],
  },
  {
    design: {
      slug: "pleated-midi-dress",
      name: "Pleated Midi Dress",
      category: "dress",
      occasions: ["Party", "Office", "Engagement"],
      description:
        "A fitted bodice with princess seams and a full box-pleated midi skirt with pockets. Choose the neckline: high-neck halter, folded off-shoulder or V-wrap halter. Concealed back zip.",
      base_price: 13500,
      fabric_metres: 3.8,
      default_fabric: "crepe",
      fabric_keys: ["crepe", "satin", "linen", "cotton"],
      addon_groups: ["length", "lining", "pockets"],
      default_options: ["len-design", "lining-half", "pockets-side"],
      featured: true,
      badge: "3 necklines",
    },
    regions: [["main", "Dress", "navy"]],
  },
  {
    design: {
      slug: "blush-draped-chiffon-gown",
      name: "Blush Draped Chiffon Gown",
      category: "dress",
      occasions: ["Wedding", "Engagement", "Party"],
      description:
        "A floor-length chiffon gown with a soft cowl neckline, cap-sleeve shoulder straps and a fitted bodice. Fabric is gathered at the hip and falls in a cascading side drape.",
      base_price: 21500,
      fabric_metres: 5.5,
      default_fabric: "chiffon",
      fabric_keys: ["chiffon", "satin", "silk-blend", "crepe"],
      addon_groups: ["length", "back", "lining"],
      default_options: ["len-design", "back-zip", "lining-full"],
      featured: true,
      badge: "New",
      photos: true,
    },
    regions: [["main", "Chiffon", "blush"]],
  },
  {
    design: {
      slug: "pearl-organza-midi-dress",
      name: "Pearl Organza Midi Dress",
      category: "dress",
      occasions: ["Homecoming", "Party", "Engagement"],
      description:
        "A strapless organza midi with a structured bodice and a full, layered A-line skirt, finished with hand-sewn pearls scattered across the bodice and skirt.",
      base_price: 18500,
      fabric_metres: 4.5,
      default_fabric: "organza",
      fabric_keys: ["organza", "tulle", "satin"],
      addon_groups: ["length", "back", "lining"],
      default_options: ["len-design", "back-zip", "lining-full"],
      featured: true,
      badge: "New",
      photos: true,
    },
    regions: [["main", "Organza", "blush"]],
  },
  {
    design: {
      slug: "satin-capelet-wrap-gown",
      name: "Satin Capelet Wrap Gown",
      category: "dress",
      occasions: ["Wedding", "Engagement", "Party"],
      description:
        "A two-piece in liquid satin: a boat-neck capelet that falls past the elbows, over a draped wrap skirt with a high front slit and a soft sweep. Shown in ivory, blush, mint and lavender.",
      base_price: 23500,
      fabric_metres: 5.5,
      default_fabric: "satin",
      fabric_keys: ["satin", "silk-blend", "crepe"],
      addon_groups: ["length", "lining"],
      default_options: ["len-design", "lining-full"],
      featured: true,
      badge: "New",
    },
    regions: [["main", "Satin", "ivory"]],
  },
];

export const designs: Design[] = designSeeds.map((s, i) => {
  const { photos: hasPhotos, ...d } = s.design;
  return {
    ...d,
    id: id("des", d.slug),
    images: hasPhotos ? photos(d.slug) : [],
    color_images: {},
    versions: [],
    // only designs with real photography are shown until photos are supplied
    published: Boolean(hasPhotos),
    sort: i,
    created_at: "2026-11-01T00:00:00.000Z",
    updated_at: "2026-11-01T00:00:00.000Z",
  };
});

// Designs photographed as versions (one photo set per version)
const mdPhotos = (v: string) => ["front", "back", "detail", "angle"].map((x) => `/catalog/pleated-midi-dress/${v}/${x}.webp`);
/** A version's colour photos; the colour it was originally shot in keeps its full photo set first. */
const versionColours = (v: string, keys: string[], shotIn: string) =>
  Object.fromEntries(keys.map((k) => [k, k === shotIn ? [...mdPhotos(v), `/catalog/pleated-midi-dress/${v}/colours/${k}.webp`] : [`/catalog/pleated-midi-dress/${v}/colours/${k}.webp`]]));
for (const d of designs) {
  if (d.slug !== "pleated-midi-dress") continue;
  d.images = mdPhotos("high-neck-halter");
  d.published = true;
  d.versions = [
    { key: "off-shoulder-fold", name: "Off-shoulder fold", price: 1500, images: mdPhotos("off-shoulder-fold"), color_images: versionColours("off-shoulder-fold", ["black", "navy", "dusty-rose", "emerald"], "navy") },
    { key: "v-wrap-halter", name: "V-wrap halter", price: 0, images: mdPhotos("v-wrap-halter"), color_images: versionColours("v-wrap-halter", ["black", "sage", "dusty-rose", "lavender"], "navy") },
  ];
}

// Photos of designs made in other colours (palette key -> photos), split from the colour collages
const colourPhotos: Record<string, string[]> = {
  "satin-halter-a-line-gown": ["maroon", "champagne", "sage", "navy"],
  "cocoa-tiered-maxi-skirt-set": ["maroon", "cream", "sage", "navy"],
  "maroon-tie-back-column-dress": ["maroon", "cream", "sage", "navy"],
  "aqua-one-shoulder-cape-gown": ["maroon", "champagne", "sage", "navy"],
  "sage-bloom-lehenga-set": ["maroon", "ivory", "mint", "navy"],
  "mauve-lace-drape-saree": ["royal-blue", "emerald", "red", "champagne"],
  "noir-sequin-sash-gown": ["maroon", "emerald", "royal-blue", "gold"],
  "blush-leaf-tulle-gown": ["purple", "teal", "dusty-rose", "navy"],
  "cocoa-linen-peplum-top": ["sage", "blush", "lilac", "sky"],
  "botanical-bow-shoulder-mini": ["beige", "lilac", "blush", "sage"],
  "lilac-ruffle-saree": ["lilac", "ivory", "sage", "dusty-rose"],
  "champagne-lace-high-neck-saree": ["champagne", "lilac", "blush", "mint"],
  "navy-silver-peplum-drape-saree": ["navy", "emerald", "rose-pink", "ivory"],
  "navy-sequin-fan-party-dress": ["navy", "emerald", "blush", "plum"],
  "satin-capelet-wrap-gown": ["ivory", "blush", "mint", "lavender"],
  "pleated-midi-dress": ["navy", "sage", "dusty-rose", "lavender"],
};
// photographed only as colour collages: the colour photos are the design's photos
const colourOnly = new Set(["satin-halter-a-line-gown", "satin-capelet-wrap-gown"]);
const mainColour = (slug: string) => {
  const r = designSeeds.find((s) => s.design.slug === slug)!.regions;
  return (r.find(([k]) => k === "main") ?? r[0])[2];
};
for (const d of designs) {
  const keys = colourPhotos[d.slug];
  if (!keys) continue;
  const shotIn = mainColour(d.slug);
  d.color_images = Object.fromEntries(
    keys.map((k) => {
      const photo = `/catalog/${d.slug}/colours/${k}.webp`;
      // the colour the design was originally photographed in keeps its full photo set
      return [k, k === shotIn && !colourOnly.has(d.slug) && d.images.length ? [...d.images, photo] : [photo]];
    }),
  );
  if (colourOnly.has(d.slug)) {
    d.images = keys.map((k) => `/catalog/${d.slug}/colours/${k}.webp`);
    d.published = true;
  }
}

export const designRegions: DesignRegion[] = designSeeds.flatMap((s) =>
  s.regions.map(([key, label, default_color], i) => ({
    id: `reg_${s.design.slug}_${key}`,
    design_id: id("des", s.design.slug),
    key,
    label,
    default_color,
    sort: i,
  })),
);

