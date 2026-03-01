import { supabase } from "$lib/supabaseClient";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const { data: nhat_ky } = await supabase
        .from("nhat_ky_kho")
        .select(`
            id,
            so_luong,
            loai_gd,
            ngay_ghi_so,
            phieu_lien_quan_id,
            vat_tu ( id, ten_vat_tu, don_vi )
        `)
        .order("ngay_ghi_so", { ascending: false })
        .limit(200);

    return {
        nhat_ky: nhat_ky ?? []
    };
}
