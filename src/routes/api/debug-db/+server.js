import { supabase } from "$lib/supabaseClient";
import { json } from "@sveltejs/kit";

export async function GET() {
    // Test simple query
    const { data: simple, error: simpleErr } = await supabase
        .from('mon_hoc')
        .select('id, ten_mon_hoc, ma_mon_hoc')
        .limit(5);

    // Test joined query
    const { data: joined, error: joinedErr } = await supabase
        .from('mon_hoc')
        .select(`
            id, ten_mon_hoc, ma_mon_hoc,
            khoa_mon_hoc ( khoa ( id, ten_khoa ) ),
            nganh_he_mon ( id, nganh ( id, ten_nganh ), he_dao_tao ( id, ten_he ) )
        `)
        .limit(5);

    const { data: khoa, error: khoaErr } = await supabase.from('khoa').select('*');
    const { data: nganh, error: nganhErr } = await supabase.from('nganh').select('*');
    const { data: he, error: heErr } = await supabase.from('he_dao_tao').select('*');

    return json({
        simple: { data: simple, error: simpleErr },
        joined: { data: joined, error: joinedErr },
        khoa: { data: khoa, error: khoaErr },
        nganh: { data: nganh, error: nganhErr },
        he_dao_tao: { data: he, error: heErr }
    });
}
