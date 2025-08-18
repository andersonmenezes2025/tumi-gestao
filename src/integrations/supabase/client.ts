// Adaptador para PostgreSQL - substitui o cliente Supabase
import { apiClient } from '@/lib/api-client';

// Exportar o cliente adaptado
export const supabase = apiClient;