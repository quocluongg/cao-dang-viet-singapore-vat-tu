import { supabase } from "$lib/supabaseClient";
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const { data: giao_vien, error } = await supabase
        .from("giao_vien")
        .select("*")
        .order("created_at", { ascending: false });

    return {
        giao_vien: giao_vien ?? [],
    };
}

/** @type {import('./$types').Actions} */
export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const ho_tens = formData.getAll('ho_ten');
        const ma_so_gvs = formData.getAll('ma_so_gv');
        const emails = formData.getAll('email');
        const passwords = formData.getAll('password');

        if (!ho_tens || ho_tens.length === 0) {
            return { success: false, error: 'Thiếu thông tin họ tên bắt buộc' };
        }

        const payloadTeachers = ho_tens.map((ht, index) => ({
            ho_ten: ht.toString(),
            ma_so_gv: ma_so_gvs[index]?.toString() || '',
            email: emails[index]?.toString() || '',
            password: passwords[index]?.toString() || ''
        })).filter(t => t.ho_ten.trim() !== '');

        if (payloadTeachers.length === 0) {
            return { success: false, error: 'Thiếu thông tin họ tên bắt buộc' };
        }

        const endpoint = 'https://cmiplkvwpnasywtibfvf.supabase.co/functions/v1/create-teachers';
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PUBLIC_SUPABASE_PUBLISHABLE_KEY}`
                },
                body: JSON.stringify({ teachers: payloadTeachers })
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: 'Lỗi từ hàm tạo giáo viên: ' + (result.error || response.statusText) };
            }

            let messageText = '';
            if (result.data && result.data.length > 0) {
                let successCount = 0;
                let errorMessages = [];
                for (let i = 0; i < result.data.length; i++) {
                    const tData = result.data[i];
                    if (tData.status === "Thành công") {
                        const sentTeacher = payloadTeachers.find(t => t.ho_ten === tData.ho_ten);
                        await supabase.from('giao_vien').update({ email: tData.email, mat_khau: sentTeacher?.password || 'GiaoVien@2026' }).eq('id', tData.id);
                        successCount++;
                    } else if (tData.status === "Lỗi") {
                        errorMessages.push(`${tData.ho_ten}: ${tData.message}`);
                    }
                }

                if (errorMessages.length > 0) {
                    messageText = `Thành công ${successCount} giáo viên. Lỗi: ${errorMessages.join(', ')}`;
                    return { success: successCount > 0, message: messageText, error: successCount === 0 ? messageText : undefined };
                }
                messageText = `Đã thêm thành công ${successCount} giáo viên!`;
            } else {
                return { success: false, error: 'Không nhận được dữ liệu phản hồi hợp lệ từ server' };
            }

            return { success: true, message: messageText };
        } catch (err) {
            return { success: false, error: 'Lỗi gọi hàm tạo giáo viên: ' + (err instanceof Error ? err.message : String(err)) };
        }
    },

    importData: async ({ request }) => {
        const formData = await request.formData();
        const teachersStr = formData.get('teachers')?.toString();

        if (!teachersStr) {
            return { success: false, error: 'Không nhận được dữ liệu tải lên' };
        }

        try {
            const teachers = JSON.parse(teachersStr);
            if (!Array.isArray(teachers) || teachers.length === 0) {
                return { success: false, error: 'Dữ liệu không hợp lệ hoặc trống' };
            }

            const endpoint = 'https://cmiplkvwpnasywtibfvf.supabase.co/functions/v1/create-teachers';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PUBLIC_SUPABASE_PUBLISHABLE_KEY}`
                },
                body: JSON.stringify({ teachers })
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: 'Lỗi từ hàm tạo giáo viên: ' + (result.error || response.statusText) };
            }

            let messageText = '';
            if (result.data && result.data.length > 0) {
                let successCount = 0;
                let errorMessages = [];
                for (let i = 0; i < result.data.length; i++) {
                    const tData = result.data[i];
                    if (tData.status === "Thành công") {
                        // Tìm giáo viên trong mảng gốc để lấy mật khẩu, fallback mảng ho_ten
                        const sentTeacher = teachers.find(t => t.ho_ten === tData.ho_ten);
                        await supabase.from('giao_vien').update({ email: tData.email, mat_khau: sentTeacher?.password || 'GiaoVien@2026' }).eq('id', tData.id);
                        successCount++;
                    } else if (tData.status === "Lỗi") {
                        errorMessages.push(`${tData.ho_ten}: ${tData.message}`);
                    }
                }

                if (errorMessages.length > 0) {
                    messageText = `Thành công ${successCount} giáo viên. Lỗi: ${errorMessages.join(', ')}`;
                    return { success: successCount > 0, message: messageText, error: successCount === 0 ? messageText : undefined };
                }
                messageText = `Đã nhập thành công ${successCount} giáo viên!`;
            } else {
                return { success: false, error: 'Không có dữ liệu phản hồi' };
            }

            return { success: true, message: messageText };
        } catch (err) {
            return { success: false, error: 'Lỗi xử lý file tải lên: ' + (err instanceof Error ? err.message : String(err)) };
        }
    },

    update: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();
        const ho_ten = formData.get('ho_ten')?.toString();
        const ma_so_gv = formData.get('ma_so_gv')?.toString();
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();

        if (!id || !ho_ten) {
            return { success: false, error: 'Thiếu thông tin bắt buộc' };
        }

        const updateData = { ho_ten, ma_so_gv, email, mat_khau: password };

        const { error } = await supabase.from('giao_vien').update(updateData).eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Cập nhật giáo viên thành công! (Lưu ý: Mật khẩu này chỉ để ghi nhớ trên danh sách, đăng nhập chưa bị đổi trừ khi chỉnh trong Supabase Auth)' };
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();

        const { error } = await supabase.from('giao_vien').delete().eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Xóa giáo viên thành công!' };
    }
};
