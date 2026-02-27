import { supabase } from "$lib/supabaseClient";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const { data: khoa, error } = await supabase
        .from("khoa")
        .select("*")
        .order("id", { ascending: true });

    return {
        khoa: khoa ?? [],
    };
}

/** @type {import('./$types').Actions} */
export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const ten_khoa = formData.get('ten_khoa')?.toString();

        if (!ten_khoa) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const { error: dbError } = await supabase.from('khoa').insert([
            { ten_khoa }
        ]);

        if (dbError) {
            console.error("Insert khoa error:", dbError);
            return { success: false, error: 'Lỗi thêm khoa: ' + dbError.message };
        }

        return { success: true, message: 'Thêm khoa thành công!' };
    },

    update: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();
        const ten_khoa = formData.get('ten_khoa')?.toString();

        if (!id || !ten_khoa) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const { error } = await supabase.from('khoa').update({ ten_khoa }).eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Cập nhật khoa thành công!' };
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();

        const { error } = await supabase.from('khoa').delete().eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Xóa khoa thành công!' };
    }
};
