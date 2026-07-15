const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: d1, error: e1 } = await supabase.from('rqs_pengumuman').select('*').limit(1);
    console.log('rqs_pengumuman error:', e1);

    const { data: d2, error: e2 } = await supabase.from('pengumuman').select('*').limit(1);
    console.log('pengumuman error:', e2);
}
test();
