const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const newUserToInsert = {
        id: '2cf40149-6f17-49ee-b087-010477196cb1', // some fake UUID
        nama: 'Test',
        tempat_lahir: 'Test',
        tanggal_lahir: '2000-01-01',
        username: 'test_username_123',
        phone: '08123456789',
        email: 'test12345@test.com',
        password: 'test',
        role: 'tholibah',
        is_google: true,
        verified: true
    };
    const { data: iData, error: iError } = await supabase.from('profiles').insert([newUserToInsert]).select();
    console.log('Insert error details:', iError);
}

test();
