const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Parse .env manually
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key || key === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('Supabase URL or Anon Key is missing or not configured in .env!');
  console.error('Please configure your actual VITE_SUPABASE_ANON_KEY in your .env file first.');
  process.exit(1);
}

console.log('Connecting to Supabase project:', url);
const supabase = createClient(url, key);

const email = 'ayushaslaliya37@gmail.com';
const password = 'Admin@123456';

async function main() {
  console.log(`Attempting to sign up admin user: ${email}...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Error signing up admin:', error.message);
    process.exit(1);
  }

  console.log('Successfully signed up admin!');
  console.log('User ID:', data.user ? data.user.id : 'N/A');
  console.log('Note: If Auto-confirm was enabled, you can now log in immediately.');
  console.log('Otherwise, make sure to confirm the user in the Supabase Dashboard -> Authentication tab.');
}

main();
