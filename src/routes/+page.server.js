import { supabase } from "$lib/supabaseClient";
import * as xlsx from 'xlsx';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const [vatTuRes, donViRes] = await Promise.all([
        supabase
            .from("vat_tu")
            .select("*")
            .order("created_at", { ascending: false }),
        supabase
            .from("don_vi")
            .select("ten_don_vi")
            .order("ten_don_vi", { ascending: true })
    ]);

    return {
        vat_tu: vatTuRes.data ?? [],
        don_vi_list: donViRes.data ?? [],
    };
}

/** @type {import('./$types').Actions} */
export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const ten_vat_tu = formData.get('ten_vat_tu')?.toString();
        const don_vi = formData.get('don_vi')?.toString();
        const so_luong_ton_kho = parseInt(formData.get('so_luong')?.toString() || '0');
        const don_gia_tham_khao = parseFloat(formData.get('don_gia')?.toString() || '0');
        const yeu_cau_ky_thuat = formData.get('yeu_cau_ky_thuat')?.toString();
        const hinh_anh_file = /** @type {File} */ (formData.get('hinh_anh_file'));
        let hinh_anh = formData.get('hinh_anh')?.toString() || '';

        if (hinh_anh_file && hinh_anh_file.size > 0 && hinh_anh_file.name !== 'undefined') {
            const fileExt = hinh_anh_file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('anh_vat_tu')
                .upload(fileName, hinh_anh_file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return { success: false, error: 'Lỗi upload ảnh: ' + uploadError.message };
            }

            const { data: { publicUrl } } = supabase.storage
                .from('anh_vat_tu')
                .getPublicUrl(fileName);

            hinh_anh = publicUrl;
        }

        const { error } = await supabase.from('vat_tu').insert([{
            ten_vat_tu,
            don_vi,
            so_luong_ton_kho,
            don_gia_tham_khao,
            yeu_cau_ky_thuat,
            hinh_anh: hinh_anh || null
        }]);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Thêm vật tư thành công!' };
    },

    update: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();
        const ten_vat_tu = formData.get('ten_vat_tu')?.toString();
        const don_vi = formData.get('don_vi')?.toString();
        const so_luong_ton_kho = parseInt(formData.get('so_luong')?.toString() || '0');
        const don_gia_tham_khao = parseFloat(formData.get('don_gia')?.toString() || '0');
        const yeu_cau_ky_thuat = formData.get('yeu_cau_ky_thuat')?.toString();
        const hinh_anh_file = /** @type {File} */ (formData.get('hinh_anh_file'));
        let hinh_anh = formData.get('hinh_anh')?.toString() || '';

        if (hinh_anh_file && hinh_anh_file.size > 0 && hinh_anh_file.name !== 'undefined') {
            const fileExt = hinh_anh_file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('anh_vat_tu')
                .upload(fileName, hinh_anh_file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return { success: false, error: 'Lỗi upload ảnh: ' + uploadError.message };
            }

            const { data: { publicUrl } } = supabase.storage
                .from('anh_vat_tu')
                .getPublicUrl(fileName);

            hinh_anh = publicUrl;
        }

        const { error } = await supabase.from('vat_tu').update({
            ten_vat_tu,
            don_vi,
            so_luong_ton_kho,
            don_gia_tham_khao,
            yeu_cau_ky_thuat,
            hinh_anh: hinh_anh || null
        }).eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Cập nhật vật tư thành công!' };
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();

        const { error } = await supabase.from('vat_tu').delete().eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Xóa vật tư thành công!' };
    },

    createUnit: async ({ request }) => {
        const formData = await request.formData();
        const ten_don_vi = formData.get('ten_don_vi')?.toString();

        const { error } = await supabase.from('don_vi').insert([{ ten_don_vi }]);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Thêm đơn vị thành công!' };
    },

    deleteUnit: async ({ request }) => {
        const formData = await request.formData();
        const ten_don_vi = formData.get('ten_don_vi')?.toString();

        const { error } = await supabase.from('don_vi').delete().eq('ten_don_vi', ten_don_vi);

        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Xóa đơn vị thành công!' };
    },

    importExcel: async ({ request }) => {
        try {
            const formData = await request.formData();
            const file = /** @type {File} */ (formData.get('excelDocument'));

            if (!file || file.size === 0) {
                return { success: false, error: 'Vui lòng chọn file hợp lệ.' };
            }

            const arrayBuffer = await file.arrayBuffer();
            const workbook = xlsx.read(arrayBuffer, { type: 'buffer' });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Chuyển đổi sheet thành JSON, lấy từ dòng 7 (header)
            // Trong xlsx, range option có thể dùng dể skip
            const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: "A", defval: "" });

            // Tìm dòng Header có chữ STT, Tên vật tư
            let dataStartIndex = 0;
            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row['A'] === 'STT' || row['B'] === 'Tên vật tư') {
                    dataStartIndex = i + 1;
                    break;
                }
            }

            // Mảng chứa dữ liệu insert
            const insertData = [];

            for (let i = dataStartIndex; i < jsonData.length; i++) {
                const row = jsonData[i];

                // Nếu rỗng tên vật tư thì bỏ qua
                if (!row['B']) continue;

                // Các cột theo mẫu template
                // A: STT
                // B: Tên vật tư
                // C: Yêu cầu kỹ thuật
                // D: Đơn vị tính
                // E: Số lượng
                // F: Đơn giá
                // G: Thành tiền
                // H: Ghi chú

                const ten_vat_tu = row['B']?.toString().trim();
                const yeu_cau_ky_thuat = row['C']?.toString().trim() || null;

                let raw_don_vi = row['D']?.toString().trim();
                if (raw_don_vi) {
                    raw_don_vi = raw_don_vi.charAt(0).toUpperCase() + raw_don_vi.slice(1).toLowerCase();
                }
                const don_vi = raw_don_vi || null;

                // Chuyển string thành number, nếu lỗi thì 0
                const so_luong_str = row['E']?.toString().replace(/[^\d.-]/g, '');
                const so_luong_ton_kho = so_luong_str ? parseInt(so_luong_str) : 0;

                const don_gia_str = row['F']?.toString().replace(/[^\d.-]/g, '');
                const don_gia_tham_khao = don_gia_str ? parseFloat(don_gia_str) : 0;

                insertData.push({
                    ten_vat_tu,
                    yeu_cau_ky_thuat,
                    don_vi,
                    so_luong_ton_kho,
                    don_gia_tham_khao
                });
            }

            if (insertData.length === 0) {
                return { success: false, error: 'Không tìm thấy dữ liệu hợp lệ trong file.' };
            }

            // Xử lý chèn đơn vị mới để tránh lỗi khóa ngoại (foreign key constraint)
            const uniqueUnits = [...new Set(insertData.map(item => item.don_vi).filter(Boolean))];

            if (uniqueUnits.length > 0) {
                // Lấy đơn vị đã tồn tại
                const { data: existingDonViRes, error: fetchDonViError } = await supabase
                    .from('don_vi')
                    .select('ten_don_vi')
                    .in('ten_don_vi', uniqueUnits);

                if (fetchDonViError) {
                    console.error("Fetch don_vi error:", fetchDonViError);
                    return { success: false, error: 'Lỗi khi kiểm tra đơn vị: ' + fetchDonViError.message };
                }

                const existingUnits = new Set((existingDonViRes || []).map(item => item.ten_don_vi));

                // Tìm đơn vị thiếu để chèn
                const missingUnits = uniqueUnits.filter(unit => !existingUnits.has(unit));

                if (missingUnits.length > 0) {
                    const insertDonViData = missingUnits.map(unit => ({ ten_don_vi: unit }));
                    const { error: insertDonViError } = await supabase
                        .from('don_vi')
                        .insert(insertDonViData);

                    if (insertDonViError) {
                        console.error("Insert don_vi error:", insertDonViError);
                        return { success: false, error: 'Lỗi khi tự động thêm đơn vị mới: ' + insertDonViError.message };
                    }
                }
            }

            const { error } = await supabase.from('vat_tu').insert(insertData);

            if (error) {
                console.error("Import error:", error);
                return { success: false, error: 'Lỗi khi nhập dữ liệu: ' + error.message };
            }

            return { success: true, message: `Đã nhập thành công ${insertData.length} vật tư từ Excel!` };
        } catch (err) {
            console.error(err);
            return { success: false, error: 'Có lỗi xảy ra khi xử lý file Excel.' };
        }
    }
};