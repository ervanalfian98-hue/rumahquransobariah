const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('rqs_tholibah').insert([{
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test 2',
        email: 'test@example.com',
        classes: ['Test Class']
    }]);
    console.log('rqs_tholibah insert with email:', { error });
}

test();
