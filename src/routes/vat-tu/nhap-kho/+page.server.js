import { supabase } from "$lib/supabaseClient";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const [vatTuRes, nhapKhoRes] = await Promise.all([
        supabase
            .from("vat_tu")
            .select("id, ten_vat_tu, don_vi, so_luong_ton_kho, don_gia_tham_khao")
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
            .eq("loai_gd", "nhap_kho")
            .order("ngay_ghi_so", { ascending: false })
            .limit(50)
    ]);

    return {
        vat_tu_list: vatTuRes.data ?? [],
        lich_su_nhap: nhapKhoRes.data ?? []
    };
}

/** @type {import('./$types').Actions} */
export const actions = {
    nhapKho: async ({ request }) => {
        const formData = await request.formData();
        const items_str = formData.get('items_data')?.toString();
        const ghi_chu = formData.get('ghi_chu')?.toString() || '';

        if (!items_str) {
            return { success: false, error: 'Không có dữ liệu nhập kho' };
        }

        let items;
        try {
            items = JSON.parse(items_str);
        } catch (e) {
            return { success: false, error: 'Dữ liệu không hợp lệ' };
        }

        if (!items || items.length === 0) {
            return { success: false, error: 'Danh sách nhập kho trống' };
        }

        // Validate
        for (const item of items) {
            if (!item.vat_tu_id || !item.so_luong || item.so_luong <= 0) {
                return { success: false, error: 'Vui lòng điền đầy đủ thông tin và số lượng > 0' };
            }
        }

        // Tạo ID phiếu dùng chung
        const phieu_id = crypto.randomUUID();

        // Ghi nhật ký kho cho từng vật tư
        const nhatKyData = items.map((/** @type {any} */ item) => ({
            vat_tu_id: parseInt(item.vat_tu_id),
            so_luong: parseInt(item.so_luong),
            loai_gd: 'nhap_kho',
            phieu_lien_quan_id: phieu_id
        }));

        const { error: nkError } = await supabase.from('nhat_ky_kho').insert(nhatKyData);
        if (nkError) return { success: false, error: 'Lỗi ghi nhật ký: ' + nkError.message };

        // Cập nhật tồn kho cho từng vật tư
        for (const item of items) {
            const { data: vt } = await supabase
                .from('vat_tu')
                .select('so_luong_ton_kho')
                .eq('id', item.vat_tu_id)
                .single();

            const newQty = (vt?.so_luong_ton_kho || 0) + parseInt(item.so_luong);
            await supabase.from('vat_tu').update({ so_luong_ton_kho: newQty }).eq('id', item.vat_tu_id);
        }

        return { success: true, message: `Đã nhập kho thành công ${items.length} loại vật tư! Mã phiếu: ${phieu_id.substring(0, 8).toUpperCase()}` };
    }
};
