import { supabase } from "$lib/supabaseClient";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const { data: nganh, error } = await supabase
        .from("nganh")
        .select(`
            id, ten_nganh, ma_nganh, khoa_id,
            khoa ( id, ten_khoa )
        `)
        .order("id", { ascending: true });

    const { data: khoa_list } = await supabase
        .from("khoa")
        .select("*")
        .order("ten_khoa", { ascending: true });

    return {
        nganh: nganh ?? [],
        khoa_list: khoa_list ?? []
    };
}

/** @type {import('./$types').Actions} */
export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const ten_nganh = formData.get('ten_nganh')?.toString();
        const ma_nganh = formData.get('ma_nganh')?.toString() || null;
        let khoa_id = formData.get('khoa_id')?.toString();

        if (!ten_nganh) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const insertData = { ten_nganh, ma_nganh, khoa_id: khoa_id ? parseInt(khoa_id) : null };

        const { error: dbError } = await supabase.from('nganh').insert([insertData]);

        if (dbError) {
            console.error("Insert error:", dbError);
            return { success: false, error: 'Lỗi thêm Ngành: ' + dbError.message };
        }

        return { success: true, message: 'Thêm Ngành thành công!' };
    },

    update: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();
        const ten_nganh = formData.get('ten_nganh')?.toString();
        const ma_nganh = formData.get('ma_nganh')?.toString() || null;
        let khoa_id = formData.get('khoa_id')?.toString();

        if (!id || !ten_nganh) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const updateData = { ten_nganh, ma_nganh, khoa_id: khoa_id ? parseInt(khoa_id) : null };
        const { error } = await supabase.from('nganh').update(updateData).eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Cập nhật Ngành thành công!' };
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();

        const { error } = await supabase.from('nganh').delete().eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Xóa Ngành thành công!' };
    }
};
