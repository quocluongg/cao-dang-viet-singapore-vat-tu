import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, l) => {
    const [k, v] = l.split('=');
    if (k) acc[k] = v.trim();
    return acc;
}, {});

const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function check() {
    const insertData = [{
        phieu_id: '5cca3116-ab43-5404-70e0-000000000000', // Need a valid phieu_id
        vat_tu_id: 1,
        so_luong_de_xuat: 1,
        mon_hoc_id: 1,
    }];

    const { data: p } = await supabase.from('phieu_de_xuat').select('id').limit(1).single();
    if (p) insertData[0].phieu_id = p.id;

    const { data, error } = await supabase.from('chi_tiet_de_xuat').insert(insertData);
    console.log("error:", error);
}
check();
