const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('rqs_setoran_hafalan').insert([{
        tholibah_id: '123e4567-e89b-12d3-a456-426614174000',
        surat_target: 'Test',
        ayat_target: '1-10',
        status: 'menunggu',
        tanggal: new Date().toISOString()
    }]).select();
    console.log('rqs_setoran_hafalan tholibah insert:', { data, error });
}

test();
