import { supabase } from "$lib/supabaseClient";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const { data: mon_hoc, error } = await supabase
        .from("mon_hoc")
        .select(`
            id, ten_mon_hoc, ma_mon_hoc, ghi_chu,
            khoa_mon_hoc (
                khoa ( id, ten_khoa )
            ),
            nganh_he_mon (
                id,
                nganh ( id, ten_nganh, ma_nganh ),
                he_dao_tao ( id, ten_he )
            )
        `)
        .order("id", { ascending: true });

    const { data: khoa_list } = await supabase.from("khoa").select("*");
    const { data: nganh_list } = await supabase.from("nganh").select("*");
    const { data: he_dao_tao_list } = await supabase.from("he_dao_tao").select("*");

    return {
        mon_hoc: mon_hoc ?? [],
        khoa_list: khoa_list ?? [],
        nganh_list: nganh_list ?? [],
        he_dao_tao_list: he_dao_tao_list ?? []
    };
}

/** @type {import('./$types').Actions} */
export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const ten_mon_hoc = formData.get('ten_mon_hoc')?.toString();
        const ma_mon_hoc = formData.get('ma_mon_hoc')?.toString();
        const ghi_chu = formData.get('ghi_chu')?.toString();
        const khoa_ids = formData.getAll('khoa_ids'); // mảng các khoa id
        const nganh_he_data_str = formData.get('nganh_he_data')?.toString(); // JSON string chứa mảng { nganh_id, he_id }

        if (!ten_mon_hoc || !ma_mon_hoc) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const { data: newMonHoc, error: dbError } = await supabase.from('mon_hoc').insert([
            { ten_mon_hoc, ma_mon_hoc, ghi_chu }
        ]).select().single();

        if (dbError) {
            return { success: false, error: 'Lỗi thêm môn học: ' + dbError.message };
        }

        // Add Khoa
        if (khoa_ids && khoa_ids.length > 0) {
            const khoaMonHocData = khoa_ids.map(khoa_id => ({
                mon_hoc_id: newMonHoc.id,
                khoa_id: parseInt(khoa_id.toString())
            }));
            await supabase.from('khoa_mon_hoc').insert(khoaMonHocData);
        }

        // Add Nganh He
        if (nganh_he_data_str) {
            try {
                const nganhHeList = JSON.parse(nganh_he_data_str);
                if (nganhHeList && nganhHeList.length > 0) {
                    const insertData = nganhHeList.map((/** @type {any} */ item) => ({
                        mon_hoc_id: newMonHoc.id,
                        nganh_id: parseInt(item.nganh_id),
                        he_id: parseInt(item.he_id)
                    }));
                    await supabase.from('nganh_he_mon').insert(insertData);
                }
            } catch (e) {
                console.error("Parse nganh_he_data error", e);
            }
        }

        return { success: true, message: 'Thêm môn học thành công!' };
    },

    update: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();
        const ten_mon_hoc = formData.get('ten_mon_hoc')?.toString();
        const ma_mon_hoc = formData.get('ma_mon_hoc')?.toString();
        const ghi_chu = formData.get('ghi_chu')?.toString();
        const khoa_ids = formData.getAll('khoa_ids');
        const nganh_he_data_str = formData.get('nganh_he_data')?.toString();

        if (!id || !ten_mon_hoc || !ma_mon_hoc) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const { error } = await supabase.from('mon_hoc').update({ ten_mon_hoc, ma_mon_hoc, ghi_chu }).eq('id', id);

        if (error) return { success: false, error: error.message };

        // Xóa quan hệ Khoa cũ và thêm Nhanh
        await supabase.from('khoa_mon_hoc').delete().eq('mon_hoc_id', id);
        if (khoa_ids && khoa_ids.length > 0) {
            const khoaMonHocData = khoa_ids.map(khoa_id => ({
                mon_hoc_id: parseInt(id),
                khoa_id: parseInt(khoa_id.toString())
            }));
            await supabase.from('khoa_mon_hoc').insert(khoaMonHocData);
        }

        // Xóa quan hệ Nganh He cũ và thêm mới
        await supabase.from('nganh_he_mon').delete().eq('mon_hoc_id', id);
        if (nganh_he_data_str) {
            try {
                const nganhHeList = JSON.parse(nganh_he_data_str);
                if (nganhHeList && nganhHeList.length > 0) {
                    const insertData = nganhHeList.map((/** @type {any} */ item) => ({
                        mon_hoc_id: parseInt(id),
                        nganh_id: parseInt(item.nganh_id),
                        he_id: parseInt(item.he_id)
                    }));
                    await supabase.from('nganh_he_mon').insert(insertData);
                }
            } catch (e) {
                console.error("Parse nganh_he_data error", e);
            }
        }

        return { success: true, message: 'Cập nhật môn học thành công!' };
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();

        await supabase.from('nganh_he_mon').delete().eq('mon_hoc_id', id);
        await supabase.from('khoa_mon_hoc').delete().eq('mon_hoc_id', id);
        const { error } = await supabase.from('mon_hoc').delete().eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Xóa môn học thành công!' };
    }
};
