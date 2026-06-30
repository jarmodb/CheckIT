import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const LISTS_TABLE = 'checkit_lists'
export const ITEMS_TABLE = 'checkit_items'

export type List = {
  id: string
  name: string
  created_at: string
}

export type Item = {
  id: string
  list_id: string
  text: string
  created_by: string
  completed: boolean
  completed_by: string | null
  created_at: string
  completed_at: string | null
}
