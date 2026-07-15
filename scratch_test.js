const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: pData, error: pError } = await supabase.from('profiles').select('*').limit(1);
    console.log('profiles table sample:', JSON.stringify(pData));
    
    // Attempt to insert a mock profile to see the schema
    const { data: iData, error: iError } = await supabase.from('profiles').insert([{}]).select();
    console.log('Insert error details:', iError);
}

test();
