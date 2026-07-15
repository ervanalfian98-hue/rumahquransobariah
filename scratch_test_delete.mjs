import fs from 'fs';

const supabaseUrl = 'https://jaoijncravvbioozjquz.supabase.co';
const supabaseKey = 'sb_publishable_BRlStpigfge6NxTdNS5nZg_5ycBtUHB';

async function testDelete() {
    console.log("Testing DELETE...");
    const res = await fetch(`${supabaseUrl}/rest/v1/rqs_classes?id=eq.tes_1784126680589`, {
        method: 'DELETE',
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
    
    console.log("Deleted successfully. Status:", res.status);
}

testDelete();
