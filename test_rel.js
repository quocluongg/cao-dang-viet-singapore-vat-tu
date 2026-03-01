import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, l) => {
    const [k, v] = l.split('=');
    if (k) acc[k] = v.trim();
    return acc;
}, {});

const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function check() {
    const { data, error } = await supabase.from('phieu_de_xuat').select(`
            *,
            chi_tiet_de_xuat (
                id,
                so_luong_de_xuat,
                so_luong_thuc_xuat,
                vat_tu ( id, ten_vat_tu ),
                mon_hoc ( id, ten_mon_hoc )
            )
        `).limit(1);
    console.log("error:", error);
    console.log("data:", JSON.stringify(data, null, 2));
}
check();
