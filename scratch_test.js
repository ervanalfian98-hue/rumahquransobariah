const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('absensi').insert([{}]).select();
    console.log('empty insert absensi:', { error, data });
}

test();
