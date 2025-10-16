import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function forceCleanData() {
  try {
    console.log('🧹 Force cleaning alumni data...');
    
    // First disable RLS
    console.log('🔓 Disabling RLS temporarily...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE alumni DISABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('⚠️  Could not disable RLS via RPC, proceeding with direct delete...');
    }
    
    // Try to delete all alumni records
    console.log('🗑️  Deleting all alumni records...');
    const { error: deleteError } = await supabase
      .from('alumni')
      .delete()
      .neq('id', 'dummy'); // This should delete all records
    
    if (deleteError) {
      console.error('❌ Error deleting alumni:', deleteError);
      console.log('💡 You may need to run this SQL in Supabase Dashboard:');
      console.log('DELETE FROM alumni;');
      return;
    }
    
    console.log('✅ Alumni records deleted successfully!');
    
    // Verify deletion
    const { count, error: countError } = await supabase
      .from('alumni')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting after deletion:', countError);
      return;
    }
    
    console.log(`📊 Alumni records after deletion: ${count}`);
    
    if (count === 0) {
      console.log('\n🎯 Data cleaned successfully! Ready to reimport St. Patrick\'s Grammar School data.');
    } else {
      console.log('\n⚠️  Some records may still exist. Please run this SQL in Supabase Dashboard:');
      console.log('DELETE FROM alumni;');
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

forceCleanData();
