import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://xlwvvudbtjkwnxlqbmzs.supabase.co'
const supabaseKey = 'sb_publishable_dhrSV_MZz9fn3V2bOslhJw_g3ZUVwM8'

export const supabase = createClient(supabaseUrl, supabaseKey)