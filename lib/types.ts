// Shared domain types. Mirrors supabase/migrations/0001_init.sql.

export type ID = string;

export interface PaletteColor {
  id: ID;
  key: string;
  name: string;
  hex: string;
  sort: number;
  active: boolean;
}

export interface Fabric {
  id: ID;
  key: string;
  name: string;
  note: string;
  price_modifier: number;
  /** palette keys available in this fabric; null = all colours */
  available_colors: string[] | null;
  sort: number;
  active: boolean;
}

export interface AddonGroup {
  id: ID;
  key: string;
  name: string;
  description: string;
  selection: "single" | "multi";
  sort: number;
}

export interface AddonOption {
  id: ID;
  key: string;
  group_key: string;
  name: string;
  description: string;
  price: number;
  price_type: "fixed" | "per_metre";
  /** photo shown on the option button (uploaded later) */
  image_url: string | null;
  sort: number;
  active: boolean;
}

export interface AddonRule {
  id: ID;
  option_a: string;
  option_b: string;
  reason: string;
}

export interface SizeOption {
  id: ID;
  key: string;
  label: string;
  modifier: number;
  note: string;
  sort: number;
}

export interface DeliveryFee {
  district: string;
  fee: number;
}

export interface Settings {
  range_percent: number;
  custom_color_fee: number;
  standard_lead_days: number;
  rush_min_days: number;
  rush_fee_percent: number;
  advance_percent: number;
  quote_valid_days: number;
  weekly_capacity: number;
  max_quantity: number;
  bank: { accountName: string; bank: string; branch: string; accountNumber: string };
  delivery_fees: DeliveryFee[];
}

export interface Design {
  id: ID;
  slug: string;
  name: string;
  category: string;
  occasions: string[];
  description: string;
  base_price: number;
  fabric_metres: number;
  default_fabric: string;
  fabric_keys: string[];
  addon_groups: string[];
  default_options: string[];
  images: string[];
  /** photos of the design made in a specific colour: palette key -> image URLs (first = cover) */
  color_images: Record<string, string[]>;
  /** photographed variations; empty = design has no versions */
  versions: DesignVersion[];
  published: boolean;
  featured: boolean;
  sort: number;
  badge: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DesignRegion {
  id: ID;
  design_id: ID;
  key: string;
  label: string;
  default_color: string;
  sort: number;
}

export interface Catalog {
  palette: PaletteColor[];
  fabrics: Fabric[];
  groups: AddonGroup[];
  options: AddonOption[];
  rules: AddonRule[];
  sizes: SizeOption[];
  settings: Settings;
}

export interface DesignBundle {
  design: Design;
  regions: DesignRegion[];
}

/** A photographed variation of a design (e.g. "With ornaments"). Customers pick it by its photo. */
export interface DesignVersion {
  key: string;
  name: string;
  /** added to the base price (can be 0 or negative) */
  price: number;
  images: string[];
}

export interface Selections {
  /** chosen DesignVersion key, or null for the design as photographed */
  version: string | null;
  /** region key -> palette key or "#rrggbb" */
  colors: Record<string, string>;
  fabric: string;
  /** add-on option keys */
  options: string[];
  /** how we get measurements: "studio" | "on-file" | "own" (see seed sizes) */
  size: string;
  /** chart size and/or body measurements in cm, when the customer sends their own */
  measurements: Measurements | null;
  qty: number;
  neededBy: string | null;
  notes: string;
}

export interface Measurements {
  chart: string | null;
  bust: number | null;
  waist: number | null;
  hip: number | null;
  length: number | null;
}

export interface PriceLine {
  label: string;
  amount: number;
  kind: "base" | "version" | "fabric" | "addon" | "size" | "colour" | "rush";
}

export interface PriceResult {
  lines: PriceLine[];
  unit: number;
  quantity: number;
  subtotal: number;
  rushFee: number;
  total: number;
  min: number;
  max: number;
  rush: boolean;
  tooSoon: boolean;
  leadDays: number;
}

export const ORDER_STATUSES = [
  "draft",
  "quote_requested",
  "quoted",
  "advance_paid",
  "measurement_booked",
  "measured",
  "cutting",
  "sewing",
  "fitting",
  "ready",
  "delivered",
  "collected",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface StatusEvent {
  status: OrderStatus;
  at: string;
  by?: string;
}

export interface Configuration {
  id: ID;
  code: string;
  design_id: ID;
  design_slug: string;
  guest_id: string | null;
  user_id: string | null;
  selections: Selections;
  price_min: number;
  price_max: number;
  price_total: number;
  price_breakdown: PriceResult;
  notes: string;
  needed_by: string | null;
  created_at: string;
}

export interface CustomRequest {
  id: ID;
  code: string;
  guest_id: string | null;
  user_id: string | null;
  name: string;
  phone: string;
  reference_url: string | null;
  notes: string;
  occasion: string;
  budget: string | null;
  needed_by: string | null;
  size_notes: string;
  status: string;
  created_at: string;
}

export interface RequestFile {
  id: ID;
  custom_request_id: ID;
  path: string;
  content_type: string;
  size: number;
  created_at: string;
}

export interface Order {
  id: ID;
  code: string;
  access_key: string;
  kind: "design" | "custom";
  configuration_id: ID | null;
  custom_request_id: ID | null;
  guest_id: string | null;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  status: OrderStatus;
  status_history: StatusEvent[];
  fulfilment: "pickup" | "delivery";
  district: string | null;
  delivery_address: string | null;
  internal_notes: string;
  whatsapp_clicked_at: string | null;
  paid_in_full: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: ID;
  order_id: ID;
  amount: number;
  advance_percent: number;
  advance_amount: number;
  delivery_fee: number;
  valid_until: string;
  status: "issued" | "accepted" | "superseded";
  note: string;
  created_at: string;
  accepted_at: string | null;
}

export interface Payment {
  id: ID;
  order_id: ID;
  quote_id: ID;
  type: "advance" | "final";
  amount: number;
  slip_path: string;
  status: "pending" | "approved" | "rejected";
  reject_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface MeasurementSlot {
  id: ID;
  starts_at: string;
  mode: "studio" | "home";
  capacity: number;
  created_at: string;
}

export interface MeasurementBooking {
  id: ID;
  slot_id: ID;
  order_id: ID;
  mode: "studio" | "home";
  address: string | null;
  status: "booked" | "cancelled";
  created_at: string;
}

export interface EventRow {
  id: ID;
  type: string;
  code: string | null;
  guest_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface AuditRow {
  id: ID;
  actor: string;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: Record<string, unknown>;
  created_at: string;
}
