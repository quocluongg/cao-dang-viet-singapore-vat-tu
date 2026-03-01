import { createClient } from '@supabase/supabase-js';

const PUBLIC_SUPABASE_URL = "https://cmiplkvwpnasywtibfvf.supabase.co";
const PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_AN3_5778M8W2s-HBtCMk4Q_3btL7kdw";

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id, ho_ten');
    console.log('profiles count:', profiles?.length, 'error:', pError);

    const { data: gv, error: gError } = await supabase.from('giao_vien').select('id, ho_ten');
    console.log('giao_vien count:', gv?.length, 'error:', gError);

    if (gv?.length > 0 && (!profiles || profiles.length === 0)) {
        console.log('Found teachers in giao_vien but NOT in profiles!');
        // Let's seed phieu_de_xuat using giao_vien, wait can we? 
        // The table constraint: phieu_de_xuat_nguoi_de_xuat_id_fkey FOREIGN KEY (nguoi_de_xuat_id) REFERENCES profiles(id)
        // So if there are no profiles, we can't insert a phieu_de_xuat linking to a giao_vien unless both tables track the auth.user.id.
        // Let's verify if the giao_vien ids exist in profiles, or if we can insert them into profiles.

        for (const g of gv) {
            console.log('Giao vien', g.id, g.ho_ten);
            // Try to insert a dummy profile to match
            const { error: insErr } = await supabase.from('profiles').insert([{ id: g.id, ho_ten: g.ho_ten, role: 'giao_vien' }]);
            if (insErr) {
                if (!insErr.message.includes('duplicate')) {
                    console.log('Err inserting profile:', insErr);
                }
            } else {
                console.log('Inserted profile for', g.ho_ten);
            }
        }
    }

    // Re-fetch profiles
    const { data: profs } = await supabase.from('profiles').select('id, ho_ten').limit(3);
    const { data: vt } = await supabase.from('vat_tu').select('id, ten_vat_tu').limit(5);
    const { data: mh } = await supabase.from('mon_hoc').select('id, ten_mon_hoc').limit(2);

    if (!profs || !vt || !profs.length || !vt.length) {
        console.log('Not enough data to seed', profs?.length, vt?.length);
        return;
    }

    const phieuData = [
        { nguoi_de_xuat_id: profs[0].id, ly_do_de_xuat: 'Đề xuât giấy vệ sinh', trang_thai: 'nhap_thanh' },
        { nguoi_de_xuat_id: profs[1 % profs.length].id, ly_do_de_xuat: 'Đề xuất nước khử khuẩn', trang_thai: 'cho_duyet' },
        { nguoi_de_xuat_id: profs[2 % profs.length].id, ly_do_de_xuat: 'Mua Sắm dụng cụ kỹ thuật', trang_thai: 'mua_sam' },
        { nguoi_de_xuat_id: profs[0].id, ly_do_de_xuat: 'Thiết bị sẵn sàng phân bổ', trang_thai: 'san_sang' },
        { nguoi_de_xuat_id: profs[1 % profs.length].id, ly_do_de_xuat: 'Mua sách thư viện', trang_thai: 'da_duyet' }
    ];

    let successCount = 0;
    for (let i = 0; i < phieuData.length; i++) {
        const phieu = phieuData[i];
        const { data: newPhieu, error: errPhieu } = await supabase.from('phieu_de_xuat').insert([phieu]).select('id').single();
        if (newPhieu) {
            successCount++;
            await supabase.from('chi_tiet_de_xuat').insert([
                { phieu_id: newPhieu.id, mon_hoc_id: mh?.[0]?.id, vat_tu_id: vt[0].id, so_luong_de_xuat: 2 },
                { phieu_id: newPhieu.id, mon_hoc_id: mh?.[1]?.id, vat_tu_id: vt[1 % vt.length].id, so_luong_de_xuat: 1 }
            ]);
        } else {
            console.log('Err phieu:', errPhieu);
        }
    }
    console.log('Seeded successfully! Count:', successCount);
}

run();
