
import { User } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type Company = Tables<'companies'>;

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  error: string | null;
}
