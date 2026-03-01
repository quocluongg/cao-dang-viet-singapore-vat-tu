const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cmiplkvwpnasywtibfvf.supabase.co', 'sb_publishable_AN3_5778M8W2s-HBtCMk4Q_3btL7kdw');
async function run() {
    const { data, error } = await supabase.from('giao_vien').select('*');
    console.dir(data, { depth: null });
    console.error(error);
}
run();
