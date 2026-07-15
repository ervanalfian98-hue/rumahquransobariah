import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const configContent = fs.readFileSync('D:/PROJECT PEMBUATAN APLIKASI/rumahquransobariah/app/lib/supabaseClient.js', 'utf8');
const urlMatch = configContent.match(/const supabaseUrl = '([^']+)'/);
const keyMatch = configContent.match(/const supabaseAnonKey = '([^']+)'/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
    const { data, error } = await supabase.from('rqs_classes').select('*').order('order_index', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true });
    console.log("Error:", error);
}
check();
