export type BranchType = "boutique" | "boutique_salon";
export type RoleName = "admin" | "staff";
export type PaymentMethod = "cash" | "momo" | "card";

export interface Branch {
  id: string;
  name: string;
  display_name: string;
  location: string;
  type: BranchType;
  created_at: string;
}

export interface Staff {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: RoleName;
  branch_id?: string;
  is_active: boolean;
  created_at: string;
  branch?: Branch;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Inventory {
  id: string;
  product_id: string;
  branch_id: string;
  quantity: number;
  restock_threshold: number;
  last_restocked_at?: string;
  updated_at: string;
  product?: Product;
  branch?: Branch;
}

export interface Sale {
  id: string;
  branch_id: string;
  staff_id: string;
  total_amount: number;
  payment_method: PaymentMethod;
  receipt_number: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  branch?: Branch;
  staff?: Staff;
  sale_items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface RestockLog {
  id: string;
  product_id: string;
  branch_id: string;
  quantity_added: number;
  restocked_by: string;
  notes?: string;
  created_at: string;
  product?: Product;
  branch?: Branch;
  staff?: Staff;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  max_quantity: number;
  image_url?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsMap {
  logo_url: string;
  hero_image_url: string;
  tweapease_hero_url: string;
  abaam_hero_url: string;
  site_tagline: string;
  abaam_salon_description: string;
}
