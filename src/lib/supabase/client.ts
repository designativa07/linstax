import { createBrowserClient } from '@supabase/ssr'
import { supabaseConfig } from './config'

// Singleton pattern to avoid multiple instances
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      supabaseConfig.url,
      supabaseConfig.anonKey
    )
  }
  return supabaseInstance
}

export const supabase = createClient()
