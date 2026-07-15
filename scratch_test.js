const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    // try selecting from users
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log('users test:', { error, data });
}

test();
