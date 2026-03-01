import { createClient } from '@supabase/supabase-js';

const PUBLIC_SUPABASE_URL = "https://cmiplkvwpnasywtibfvf.supabase.co";
const PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_AN3_5778M8W2s-HBtCMk4Q_3btL7kdw";

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
    const { data: profiles } = await supabase.from('profiles').select('id, ho_ten').limit(3);
    const { data: vt } = await supabase.from('vat_tu').select('id, ten_vat_tu, don_gia_tham_khao').limit(5);
    const { data: mh } = await supabase.from('mon_hoc').select('id, ten_mon_hoc').limit(2);

    if (!profiles || !vt || !profiles.length || !vt.length) {
        console.log('Not enough data to seed', profiles?.length, vt?.length);
        return;
    }

    console.log('Got data:', profiles.length, 'profiles', vt.length, 'vattu', mh?.length, 'monhoc');

    const phieuData = [
        { nguoi_de_xuat_id: profiles[0].id, ly_do_de_xuat: 'Phiếu Nháp Vật Tư (Khẩn cấp) - Tự động', trang_thai: 'nhap_thanh' },
        { nguoi_de_xuat_id: profiles[1 % profiles.length].id, ly_do_de_xuat: 'Đề xuất Khoa Công Nghệ (Testing) - Tự động', trang_thai: 'cho_duyet' },
        { nguoi_de_xuat_id: profiles[2 % profiles.length].id, ly_do_de_xuat: 'Mua Sắm cho đợt thi học kỳ - Tự động', trang_thai: 'mua_sam' },
        { nguoi_de_xuat_id: profiles[0].id, ly_do_de_xuat: 'Thiết bị sẵn sàng phân bổ - Tự động', trang_thai: 'san_sang' },
        { nguoi_de_xuat_id: profiles[1 % profiles.length].id, ly_do_de_xuat: 'Đã hoàn tất thanh toán - Tự động', trang_thai: 'da_duyet' }
    ];

    let successCount = 0;
    for (let i = 0; i < phieuData.length; i++) {
        const phieu = phieuData[i];
        console.log('Inserting phieu:', phieu.trang_thai);
        const { data: newPhieu, error } = await supabase.from('phieu_de_xuat').insert([phieu]).select('id').single();
        if (newPhieu) {
            console.log('Inserted phieu', newPhieu.id);
            successCount++;
            const res = await supabase.from('chi_tiet_de_xuat').insert([
                { phieu_id: newPhieu.id, mon_hoc_id: mh?.[0]?.id, vat_tu_id: vt[0].id, so_luong_de_xuat: 3 },
                { phieu_id: newPhieu.id, mon_hoc_id: mh?.[1]?.id, vat_tu_id: vt[1 % vt.length].id, so_luong_de_xuat: 7 }
            ]);
            console.log('Inserted details', res.error || 'ok');
        } else {
            console.log('Error inserting phieu:', error);
        }
    }
    console.log('Seeded successfully with PROFILES! Count:', successCount);
}

run();
