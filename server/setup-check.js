import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gphlejllfvcsrgdfelma.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log('Testing storage bucket creation...');
  const { data: bucket, error: bucketErr } = await supabase.storage.createBucket('proofs', {
    public: true,
    fileSizeLimit: 10485760 // 10MB
  });
  console.log('Create Bucket:', { bucket, bucketErr });

  const { data: buckets } = await supabase.storage.listBuckets();
  console.log('Current buckets:', buckets);

  // Check pg-meta or sql execution
  const res = await fetch(`${supabaseUrl}/pg/query`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: 'SELECT 1;' })
  });
  console.log('/pg/query status:', res.status, await res.text());
}

main().catch(console.error);

