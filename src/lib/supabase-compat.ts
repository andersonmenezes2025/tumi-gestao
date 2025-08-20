// Compatibility layer to replace Supabase imports
export { apiClient as supabase } from '@/lib/api-client';
export * from '@/types/database';

// Export commonly used types for backward compatibility
export type Tables<T extends string> = T extends 'profiles' ? import('@/types/database').Profile
  : T extends 'companies' ? import('@/types/database').Company
  : T extends 'products' ? import('@/types/database').Product
  : T extends 'customers' ? import('@/types/database').Customer
  : T extends 'sales' ? import('@/types/database').Sale
  : T extends 'sale_items' ? import('@/types/database').SaleItem
  : T extends 'quotes' ? import('@/types/database').Quote
  : T extends 'quote_items' ? import('@/types/database').QuoteItem
  : T extends 'product_categories' ? import('@/types/database').ProductCategory
  : T extends 'product_units' ? import('@/types/database').ProductUnit
  : T extends 'suppliers' ? import('@/types/database').Supplier
  : T extends 'product_purchases' ? import('@/types/database').ProductPurchase
  : T extends 'accounts_receivable' ? import('@/types/database').AccountsReceivable
  : T extends 'accounts_payable' ? import('@/types/database').AccountsPayable
  : T extends 'agenda_events' ? import('@/types/database').AgendaEvent
  : T extends 'online_quotes' ? import('@/types/database').OnlineQuote
  : T extends 'online_quote_items' ? import('@/types/database').OnlineQuoteItem
  : any;