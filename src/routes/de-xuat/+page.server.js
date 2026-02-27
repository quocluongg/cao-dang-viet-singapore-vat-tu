import { supabase } from "$lib/supabaseClient";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const { data: phieu_de_xuat, error } = await supabase
        .from("phieu_de_xuat")
        .select(`
            *,
            giao_vien ( id, ho_ten ),
            chi_tiet_de_xuat (
                id,
                so_luong_de_xuat,
                so_luong_da_cap,
                vat_tu ( id, ten_vat_tu, don_vi, yeu_cau_ky_thuat ),
                mon_hoc ( id, ten_mon_hoc, ma_mon_hoc ),
                khoa ( id, ten_khoa ),
                nganh ( id, ten_nganh ),
                he_dao_tao ( id, ten_he )
            )
        `)
        .order("ngay_de_xuat", { ascending: false });

    // Load lookups
    const [gv, vt, mh, kh, ng, he] = await Promise.all([
        supabase.from("giao_vien").select("id, ho_ten").order("ho_ten", { ascending: true }),
        supabase.from("vat_tu").select("id, ten_vat_tu, don_vi, so_luong, don_gia, yeu_cau_ky_thuat").order("ten_vat_tu", { ascending: true }),
        supabase.from("mon_hoc").select("id, ten_mon_hoc, ma_mon_hoc").order("ten_mon_hoc", { ascending: true }),
        supabase.from("khoa").select("id, ten_khoa").order("ten_khoa", { ascending: true }),
        supabase.from("nganh").select("id, ten_nganh").order("ten_nganh", { ascending: true }),
        supabase.from("he_dao_tao").select("id, ten_he").order("ten_he", { ascending: true })
    ]);

    return {
        phieu_de_xuat: phieu_de_xuat ?? [],
        giao_vien_list: gv.data ?? [],
        vat_tu_list: vt.data ?? [],
        mon_hoc_list: mh.data ?? [],
        khoa_list: kh.data ?? [],
        nganh_list: ng.data ?? [],
        he_dao_tao_list: he.data ?? []
    };
}

/** @type {import('./$types').Actions} */
export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const giao_vien_id = formData.get('giao_vien_id')?.toString();
        const ly_do_de_xuat = formData.get('ly_do_de_xuat')?.toString();
        const chi_tiet_data_str = formData.get('chi_tiet_data')?.toString();

        if (!giao_vien_id || !chi_tiet_data_str) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const { data: newPhieu, error: dbError } = await supabase.from('phieu_de_xuat').insert([
            { giao_vien_id, ly_do_de_xuat, trang_thai: 'cho_duyet' }
        ]).select().single();

        if (dbError) {
            return { success: false, error: 'Lỗi tạo phiếu đề xuất:' + dbError.message };
        }

        try {
            const chiTietList = JSON.parse(chi_tiet_data_str);
            if (chiTietList && chiTietList.length > 0) {
                const insertData = chiTietList.map((/** @type {any} */ item) => ({
                    phieu_id: newPhieu.id,
                    vat_tu_id: item.vat_tu_id ? parseInt(item.vat_tu_id) : null,
                    so_luong_de_xuat: parseInt(item.so_luong_de_xuat || '1'),
                    mon_hoc_id: item.mon_hoc_id ? parseInt(item.mon_hoc_id) : null,
                    khoa_id: item.khoa_id ? parseInt(item.khoa_id) : null,
                    nganh_id: item.nganh_id ? parseInt(item.nganh_id) : null,
                    he_id: item.he_id ? parseInt(item.he_id) : null,
                }));
                await supabase.from('chi_tiet_de_xuat').insert(insertData);
            }
        } catch (e) {
            console.error("Parse chi_tiet_data error", e);
        }

        return { success: true, message: 'Tạo phiếu đề xuất thành công!' };
    },

    update: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();
        const giao_vien_id = formData.get('giao_vien_id')?.toString();
        const ly_do_de_xuat = formData.get('ly_do_de_xuat')?.toString();
        const trang_thai = formData.get('trang_thai')?.toString();
        const chi_tiet_data_str = formData.get('chi_tiet_data')?.toString();

        if (!id || !giao_vien_id) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const { error } = await supabase.from('phieu_de_xuat').update({
            giao_vien_id,
            ly_do_de_xuat,
            trang_thai
        }).eq('id', id);

        if (error) return { success: false, error: error.message };

        // Xóa chi tiết cũ và thêm mới
        await supabase.from('chi_tiet_de_xuat').delete().eq('phieu_id', id);

        if (chi_tiet_data_str) {
            try {
                const chiTietList = JSON.parse(chi_tiet_data_str);
                if (chiTietList && chiTietList.length > 0) {
                    const insertData = chiTietList.map((/** @type {any} */ item) => ({
                        phieu_id: id,
                        vat_tu_id: item.vat_tu_id ? parseInt(item.vat_tu_id) : null,
                        so_luong_de_xuat: parseInt(item.so_luong_de_xuat || '1'),
                        mon_hoc_id: item.mon_hoc_id ? parseInt(item.mon_hoc_id) : null,
                        khoa_id: item.khoa_id ? parseInt(item.khoa_id) : null,
                        nganh_id: item.nganh_id ? parseInt(item.nganh_id) : null,
                        he_id: item.he_id ? parseInt(item.he_id) : null,
                    }));
                    await supabase.from('chi_tiet_de_xuat').insert(insertData);
                }
            } catch (e) {
                console.error("Parse chi_tiet_data error", e);
            }
        }

        return { success: true, message: 'Cập nhật phiếu đề xuất thành công!' };
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();

        await supabase.from('chi_tiet_de_xuat').delete().eq('phieu_id', id);
        const { error } = await supabase.from('phieu_de_xuat').delete().eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Xóa phiếu đề xuất thành công!' };
    }
};
