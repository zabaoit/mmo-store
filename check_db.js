
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCategories() {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Categories:', data);
  }
}

checkCategories();
