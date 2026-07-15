import fs from 'fs';

const configContent = fs.readFileSync('D:/PROJECT PEMBUATAN APLIKASI/rumahquransobariah/app/lib/supabaseClient.js', 'utf8');
const urlMatch = configContent.match(/const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL \|\| '([^']+)'/);
const keyMatch = configContent.match(/const supabaseKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY \|\| '([^']+)'/);

const supabaseUrl = urlMatch ? urlMatch[1] : null;
const supabaseKey = keyMatch ? keyMatch[1] : null;

if (!supabaseUrl || !supabaseKey) {
    console.log("Could not extract Supabase URL/Key from supabaseClient.js");
    process.exit(1);
}

async function testSupabase() {
    console.log("Fetching rqs_classes...");
    const res = await fetch(`${supabaseUrl}/rest/v1/rqs_classes?select=*`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    
    if (!res.ok) {
        console.log("Error:", res.status, res.statusText);
        const errText = await res.text();
        console.log("Details:", errText);
        return;
    }
    
    const data = await res.json();
    console.log(`Found ${data.length} classes.`);
    console.log(data);
}

testSupabase();
