const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: artikel, error: err1 } = await supabase.from('rqs_artikel').select('*').limit(1);
    console.log('rqs_artikel:', { error: err1, data: artikel });

    const { data: renungan, error: err2 } = await supabase.from('rqs_renungan').select('*').limit(1);
    console.log('rqs_renungan:', { error: err2, data: renungan });

    const { data: tentang, error: err3 } = await supabase.from('rqs_tentang').select('*').limit(1);
    console.log('rqs_tentang:', { error: err3, data: tentang });
}

test();
