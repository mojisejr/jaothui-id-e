import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing environment variable: SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: SUPABASE_ANON_KEY')
}

// Create and export Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Export types for database tables (these will be generated later)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: any
        Insert: any
        Update: any
      }
      farms: {
        Row: any
        Insert: any
        Update: any
      }
      farm_members: {
        Row: any
        Insert: any
        Update: any
      }
      animals: {
        Row: any
        Insert: any
        Update: any
      }
      activities: {
        Row: any
        Insert: any
        Update: any
      }
    }
  }
}

// Export typed supabase client
export type TypedSupabaseClient = SupabaseClient<Database>