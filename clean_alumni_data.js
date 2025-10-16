import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAndReimportData() {
  try {
    console.log('🧹 Cleaning alumni data (keeping admin credentials)...');
    
    // First, let's check what schools exist
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*');
    
    if (schoolsError) {
      console.error('❌ Error fetching schools:', schoolsError);
      return;
    }
    
    console.log('\n📚 Current schools in database:');
    schools.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name} (ID: ${school.id}, Code: ${school.school_code})`);
    });
    
    // Check if School ID 9 exists
    const school9 = schools.find(s => s.id === 9);
    if (!school9) {
      console.log('\n⚠️  School ID 9 not found. Creating St. Patrick\'s Grammar School Ibadan...');
      
      const { data: newSchool, error: createError } = await supabase
        .from('schools')
        .insert({
          id: 9,
          name: 'St. Patrick\'s Grammar School Ibadan',
          state: 'Oyo',
          lga: 'Ibadan',
          level: 'HI',
          school_code: 'SPA',
          description: 'Historical grammar school in Ibadan'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating school:', createError);
        return;
      }
      
      console.log('✅ Created school:', newSchool);
    } else {
      console.log('\n✅ Found School ID 9:', school9);
    }
    
    // Delete all alumni data (this will cascade to related tables)
    console.log('\n🗑️  Deleting all alumni records...');
    const { error: deleteError } = await supabase
      .from('alumni')
      .delete()
      .neq('id', 'dummy'); // Delete all records
    
    if (deleteError) {
      console.error('❌ Error deleting alumni:', deleteError);
      return;
    }
    
    console.log('✅ All alumni records deleted successfully!');
    
    // Verify deletion
    const { count, error: countError } = await supabase
      .from('alumni')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting after deletion:', countError);
      return;
    }
    
    console.log(`📊 Alumni records after deletion: ${count}`);
    
    console.log('\n🎯 Ready to reimport St. Patrick\'s Grammar School data with School ID 9');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanAndReimportData();
