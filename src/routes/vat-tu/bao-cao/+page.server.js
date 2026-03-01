import { supabase } from "$lib/supabaseClient";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const [vatTuRes, nhatKyRes] = await Promise.all([
        supabase
            .from("vat_tu")
            .select("id, ten_vat_tu, don_vi, so_luong_ton_kho, don_gia_tham_khao, created_at")
            .order("so_luong_ton_kho", { ascending: true }),
        supabase
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
            .limit(200)
    ]);

    const vat_tu = vatTuRes.data ?? [];
    const nhat_ky = nhatKyRes.data ?? [];

    // Tính thống kê
    const tongNhap = nhat_ky.filter(n => n.loai_gd === 'nhap_kho').reduce((sum, n) => sum + n.so_luong, 0);
    const tongXuat = nhat_ky.filter(n => n.loai_gd === 'xuat_kho').reduce((sum, n) => sum + n.so_luong, 0);
    const soVatTuCanBoSung = vat_tu.filter(v => (v.so_luong_ton_kho || 0) < 5).length;
    const tongGiaTri = vat_tu.reduce((sum, v) => sum + ((v.so_luong_ton_kho || 0) * (v.don_gia_tham_khao || 0)), 0);

    return {
        vat_tu,
        nhat_ky,
        stats: {
            tongNhap,
            tongXuat,
            soVatTuCanBoSung,
            tongGiaTri,
            tongLoaiVatTu: vat_tu.length
        }
    };
}
