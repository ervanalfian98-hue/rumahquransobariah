const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    console.log("Checking tables...");
    
    // Check rqs_pengajar schema
    const { data: pData, error: pErr } = await supabase.from('rqs_pengajar').select('*').limit(1);
    console.log("rqs_pengajar data:", pData, "error:", pErr);
    
    const { data: tData, error: tErr } = await supabase.from('rqs_tholibah').select('*').limit(1);
    console.log("rqs_tholibah data:", tData, "error:", tErr);
    
    const { data: jData, error: jErr } = await supabase.from('rqs_jadwal_kelas').select('*').limit(1);
    console.log("rqs_jadwal_kelas data:", jData, "error:", jErr);

    // Try inserting a dummy pengajar
    const newPengajar = {
        name: 'Test',
        gender: 'ustadz',
        classes: ['tahsin_teori']
    };
    const { data: insData, error: insErr } = await supabase.from('rqs_pengajar').insert([newPengajar]).select();
    console.log("Insert Pengajar:", insData, "error:", insErr);
}

check();
