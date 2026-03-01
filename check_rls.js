const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cmiplkvwpnasywtibfvf.supabase.co', 'sb_publishable_AN3_5778M8W2s-HBtCMk4Q_3btL7kdw');
async function run() {
    const { data, error } = await supabase.from('mon_hoc').select('*').limit(1);
    console.log(error);
}
run();
