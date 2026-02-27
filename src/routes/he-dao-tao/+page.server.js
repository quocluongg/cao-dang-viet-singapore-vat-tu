import { supabase } from "$lib/supabaseClient";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const { data: he_dao_tao, error } = await supabase
        .from("he_dao_tao")
        .select("*")
        .order("id", { ascending: true });

    return {
        he_dao_tao: he_dao_tao ?? [],
    };
}

/** @type {import('./$types').Actions} */
export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const ten_he = formData.get('ten_he')?.toString();

        if (!ten_he) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const { error: dbError } = await supabase.from('he_dao_tao').insert([
            { ten_he }
        ]);

        if (dbError) {
            console.error("Insert error:", dbError);
            return { success: false, error: 'Lỗi thêm hệ đào tạo: ' + dbError.message };
        }

        return { success: true, message: 'Thêm hệ đào tạo thành công!' };
    },

    update: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();
        const ten_he = formData.get('ten_he')?.toString();

        if (!id || !ten_he) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const { error } = await supabase.from('he_dao_tao').update({ ten_he }).eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Cập nhật hệ đào tạo thành công!' };
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();

        const { error } = await supabase.from('he_dao_tao').delete().eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Xóa hệ đào tạo thành công!' };
    }
};
