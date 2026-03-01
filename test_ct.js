import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, l) => {
    const [k, v] = l.split('=');
    if (k) acc[k] = v.trim();
    return acc;
}, {});

const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function check() {
    const { data, error } = await supabase.from('chi_tiet_de_xuat').select('*').limit(5);
    console.log("chi_tiet_de_xuat:", data);
}
check();
