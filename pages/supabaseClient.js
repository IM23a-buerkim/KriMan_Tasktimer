import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://lirupsblqmigmemjymzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NvqlTXE9lTHQj_d6VwV3Xg_6HGVOaaH';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
