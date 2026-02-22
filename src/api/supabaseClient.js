/**
 * SUPABASE CLIENT ADAPTER
 * For now, this exports a local storage mock client to run fully local.
 */
import { localClient } from './localClient';

// Export the local client as the supabase instance
export const supabase = localClient;
