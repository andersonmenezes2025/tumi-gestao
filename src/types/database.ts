// Database types for PostgreSQL schema
export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  whatsapp_number?: string;
  google_calendar_integration?: boolean;
  google_calendar_token?: string;
  creator_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  company_id: string;
  category_id?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  price: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock?: number;
  max_stock?: number;
  profit_margin_percentage?: number;
  image_url?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  document_type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  birth_date?: string;
  notes?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Sale {
  id: string;
  company_id: string;
  customer_id?: string;
  user_id?: string;
  sale_number: string;
  total_amount: number;
  discount_amount?: number;
  tax_amount?: number;
  status?: string;
  payment_method?: string;
  payment_status?: string;
  due_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  total_price: number;
  created_at?: string;
}

export interface Quote {
  id: string;
  company_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  status?: string;
  valid_until?: string;
  notes?: string;
  public_token?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

export interface ProductCategory {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductUnit {
  id: string;
  company_id: string;
  name: string;
  abbreviation: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: string;
  company_id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  cnpj?: string;
  notes?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductPurchase {
  id: string;
  company_id: string;
  product_id: string;
  supplier_id?: string;
  supplier_name?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  purchase_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccountsReceivable {
  id: string;
  company_id: string;
  customer_id?: string;
  sale_id?: string;
  description: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  payment_amount?: number;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccountsPayable {
  id: string;
  company_id: string;
  description: string;
  supplier_name?: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  payment_amount?: number;
  status?: string;
  category?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgendaEvent {
  id: string;
  company_id: string;
  title: string;
  description?: string;
  location?: string;
  type?: string;
  status?: string;
  start_date: string;
  end_date: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OnlineQuote {
  id: string;
  company_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  company_name?: string;
  message?: string;
  status?: string;
  observations?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OnlineQuoteItem {
  id: string;
  online_quote_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}