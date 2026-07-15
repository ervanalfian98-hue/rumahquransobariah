const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const newPengurus = {
        type: 'pimpinan',
        nama_lengkap: 'Testing',
        user_id: null,
        peran: 'Tester',
        deskripsi: 'Test',
        icon: 'user'
    };
    const { data, error } = await supabase.from('rqs_kepengurusan').insert([newPengurus]).select();
    console.log('insert test:', { error, data });
}

test();
