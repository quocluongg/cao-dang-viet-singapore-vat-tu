import { supabase } from "$lib/supabaseClient";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    // Fetch mon_hoc cơ bản + các bảng lookup song song
    const [monHocRes, khoaMonHocRes, nganhHeMonRes, khoaRes, nganhRes, heRes] = await Promise.all([
        supabase.from("mon_hoc").select("id, ten_mon_hoc, ma_mon_hoc, ghi_chu").order("id", { ascending: true }),
        supabase.from("khoa_mon_hoc").select("mon_hoc_id, khoa_id"),
        supabase.from("nganh_he_mon").select("id, mon_hoc_id, nganh_id, he_id"),
        supabase.from("khoa").select("id, ten_khoa"),
        supabase.from("nganh").select("id, ten_nganh, ma_nganh"),
        supabase.from("he_dao_tao").select("id, ten_he")
    ]);

    if (monHocRes.error) console.error('[mon-hoc] mon_hoc error:', monHocRes.error.message);
    if (khoaMonHocRes.error) console.error('[mon-hoc] khoa_mon_hoc error:', khoaMonHocRes.error.message);
    if (nganhHeMonRes.error) console.error('[mon-hoc] nganh_he_mon error:', nganhHeMonRes.error.message);

    const mon_hoc_list = monHocRes.data ?? [];
    const khoa_mon_hoc_list = khoaMonHocRes.data ?? [];
    const nganh_he_mon_list = nganhHeMonRes.data ?? [];
    const khoa_map = Object.fromEntries((khoaRes.data ?? []).map(k => [k.id, k]));
    const nganh_map = Object.fromEntries((nganhRes.data ?? []).map(n => [n.id, n]));
    const he_map = Object.fromEntries((heRes.data ?? []).map(h => [h.id, h]));

    // Merge thủ công: gắn khoa và nganh_he vào từng môn học
    const mon_hoc = mon_hoc_list.map(mh => {
        const khoa_mon_hoc = khoa_mon_hoc_list
            .filter(km => km.mon_hoc_id === mh.id)
            .map(km => ({ khoa: khoa_map[km.khoa_id] ?? null }))
            .filter(km => km.khoa !== null);

        const nganh_he_mon = nganh_he_mon_list
            .filter(nh => nh.mon_hoc_id === mh.id)
            .map(nh => ({
                id: nh.id,
                nganh: nganh_map[nh.nganh_id] ?? null,
                he_dao_tao: he_map[nh.he_id] ?? null
            }))
            .filter(nh => nh.nganh !== null);

        return { ...mh, khoa_mon_hoc, nganh_he_mon };
    });

    console.log('[mon-hoc] OK - merged', mon_hoc.length, 'records');

    return {
        mon_hoc,
        khoa_list: khoaRes.data ?? [],
        nganh_list: nganhRes.data ?? [],
        he_dao_tao_list: heRes.data ?? []
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
