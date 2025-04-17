// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wkdflrgeujyfbzaxeynl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZGZscmdldWp5ZmJ6YXhleW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3ODM3MzYsImV4cCI6MjA2MDM1OTczNn0.IUlw1fyMQ1TCmsVSkn3KOE0iIp8CS2Kj1Kycxg6ANsY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Optional: test connection by making a small request
async function testConnection() {
  const { error } = await supabase.from('users').select('id').limit(1);
  if (error) {
    console.error('❌ Supabase connection failed:', error.message);
  } else {
    console.log('✅ Supabase connected successfully');
  }
}

testConnection();
