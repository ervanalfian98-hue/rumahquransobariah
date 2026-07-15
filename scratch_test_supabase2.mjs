import fs from 'fs';

const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';

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
