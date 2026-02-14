/**
 * Simplified app parameters for Supabase.
 * We no longer need to handle Base44-specific URL tokens.
 */

export const appParams = {
  appId: import.meta.env.VITE_SUPABASE_URL,
  functionsVersion: 'v1'
};