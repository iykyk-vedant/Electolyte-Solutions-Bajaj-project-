
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Nexscan',
    password: 'prasad0706',
    port: 5432,
});

async function inspectData() {
    try {
        console.log('Connecting to DB...');
        const result = await pool.query('SELECT id, part_code, pcb_sr_no, mfg_month_year, created_at FROM consolidated_data ORDER BY created_at DESC LIMIT 20');
        console.log('Last 20 entries:', JSON.stringify(result.rows, null, 2));

        // Search for the specific number user mentioned
        console.log("Searching for entries with '2460'...");
        const specificRes = await pool.query("SELECT pcb_sr_no, mfg_month_year FROM consolidated_data WHERE pcb_sr_no LIKE '%2460%'");
        console.log('Entries match 2460:', JSON.stringify(specificRes.rows, null, 2));

        // Search for Jan 2025 entries (A25)
        console.log("Searching for Jan 2025 entries (Pattern %A25%)...");
        const jan25Res = await pool.query("SELECT * FROM consolidated_data WHERE pcb_sr_no LIKE '%A25%' LIMIT 5");
        console.log('Jan 2025 entries:', JSON.stringify(jan25Res.rows, null, 2));

        // Verify new logic with "2467" entry
        console.log("Testing JS-based Sequence Logic...");
        const pcb = "ES9710390B2602467"; // User's reported last entry
        const len = pcb.length;
        const last4 = pcb.substring(len - 4);
        const val1 = parseInt(last4, 10);
        const fourBeforeLast = pcb.substring(len - 5, len - 1);
        const val2 = parseInt(fourBeforeLast, 10);

        console.log(`PCB: ${pcb}`);
        console.log(`Last 4 (No check digit): ${last4} -> ${val1}`);
        console.log(`4 Before Last (With check digit): ${fourBeforeLast} -> ${val2}`);

        let maxSeq = 0;
        if (!isNaN(val1) && val1 > maxSeq) maxSeq = val1;
        if (!isNaN(val2) && val2 > maxSeq) maxSeq = val2;

        console.log(`Max Sequence Determined: ${maxSeq}`);
        console.log(`Next Sequence Should Be: ${maxSeq + 1}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

inspectData();
