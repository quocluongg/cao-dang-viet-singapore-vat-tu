const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cmiplkvwpnasywtibfvf.supabase.co', 'sb_publishable_AN3_5778M8W2s-HBtCMk4Q_3btL7kdw');

async function checkRel(name, relTable) {
    const { data, error } = await supabase.from('phieu_de_xuat').select(`*, ${relTable}(id, ho_ten)`).limit(1);
    console.log(`--- ${name} ---`);
    if (error) console.error("ERROR:", error.message);
    else console.log("SUCCESS:", data ? !!data.length : false);
}

async function run() {
    await checkRel('WITH PROFILES', 'profiles');
    await checkRel('WITH GIAO_VIEN', 'giao_vien');
}
run();
