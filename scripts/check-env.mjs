import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const candidates = [
    '.env.production.local',
    '.env.production',
    '.env.local',
    '.env',
];

for (const file of candidates) {
    const fp = path.resolve(process.cwd(), file);
    if (fs.existsSync(fp)) {
        dotenv.config({ path: fp, override: true });
    }
}

const required = [
    'NEXT_PUBLIC_API_URL', 
    
];

const missing = required.filter(k => !process.env[k]);
if (missing.length) {
    console.error('❌ Missing env vars:', missing.join(', '));
    process.exit(1);
} else {
    console.log('✅ Env OK');
}
