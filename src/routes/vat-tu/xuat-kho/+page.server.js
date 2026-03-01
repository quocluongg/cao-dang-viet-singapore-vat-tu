import { supabase } from "$lib/supabaseClient";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const [vatTuRes, xuatKhoRes] = await Promise.all([
        supabase
            .from("vat_tu")
            .select("id, ten_vat_tu, don_vi, so_luong_ton_kho")
            .order("ten_vat_tu", { ascending: true }),
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
            .eq("loai_gd", "xuat_kho")
            .order("ngay_ghi_so", { ascending: false })
            .limit(50)
    ]);

    return {
        vat_tu_list: vatTuRes.data ?? [],
        lich_su_xuat: xuatKhoRes.data ?? []
    };
}

/** @type {import('./$types').Actions} */
export const actions = {
    xuatKho: async ({ request }) => {
        const formData = await request.formData();
        const items_str = formData.get('items_data')?.toString();
        const phieu_de_xuat_id = formData.get('phieu_de_xuat_id')?.toString() || null;

        if (!items_str) {
            return { success: false, error: 'Không có dữ liệu xuất kho' };
        }

        let items;
        try {
            items = JSON.parse(items_str);
        } catch (e) {
            return { success: false, error: 'Dữ liệu không hợp lệ' };
        }

        if (!items || items.length === 0) {
            return { success: false, error: 'Danh sách xuất kho trống' };
        }

        // Kiểm tra tồn kho đủ không
        for (const item of items) {
            if (!item.vat_tu_id || !item.so_luong || item.so_luong <= 0) {
                return { success: false, error: 'Vui lòng điền đầy đủ thông tin và số lượng > 0' };
            }

            const { data: vt } = await supabase
                .from('vat_tu')
                .select('ten_vat_tu, so_luong_ton_kho')
                .eq('id', item.vat_tu_id)
                .single();

            if (!vt || (vt.so_luong_ton_kho || 0) < parseInt(item.so_luong)) {
                return {
                    success: false,
                    error: `Không đủ tồn kho cho "${vt?.ten_vat_tu || 'vật tư'}". Tồn hiện tại: ${vt?.so_luong_ton_kho || 0}`
                };
            }
        }

        const phieu_id = phieu_de_xuat_id || crypto.randomUUID();

        // Ghi nhật ký kho
        const nhatKyData = items.map((/** @type {any} */ item) => ({
            vat_tu_id: parseInt(item.vat_tu_id),
            so_luong: parseInt(item.so_luong),
            loai_gd: 'xuat_kho',
            phieu_lien_quan_id: phieu_id
        }));

        const { error: nkError } = await supabase.from('nhat_ky_kho').insert(nhatKyData);
        if (nkError) return { success: false, error: 'Lỗi ghi nhật ký: ' + nkError.message };

        // Trừ tồn kho
        for (const item of items) {
            const { data: vt } = await supabase
                .from('vat_tu')
                .select('so_luong_ton_kho')
                .eq('id', item.vat_tu_id)
                .single();

            const newQty = Math.max(0, (vt?.so_luong_ton_kho || 0) - parseInt(item.so_luong));
            await supabase.from('vat_tu').update({ so_luong_ton_kho: newQty }).eq('id', item.vat_tu_id);
        }

        return { success: true, message: `Đã xuất kho thành công ${items.length} loại vật tư!` };
    }
};
