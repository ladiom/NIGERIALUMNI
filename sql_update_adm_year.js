import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sqlUpdateAdmYear() {
  try {
    console.log('Updating adm_year using SQL...');
    
    // Use a direct SQL query to update the adm_year column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE alumni 
        SET adm_year = EXTRACT(YEAR FROM admission_date)::INTEGER 
        WHERE admission_date IS NOT NULL 
        AND adm_year IS NULL
      `
    });
    
    if (error) {
      console.error('Error executing SQL update:', error);
      return;
    }
    
    console.log('SQL update completed');
    
    // Check the results
    const { data: checkData, error: checkError } = await supabase
      .from('alumni')
      .select('id, admission_date, adm_year')
      .not('admission_date', 'is', null)
      .limit(10);
    
    if (checkError) {
      console.error('Error checking results:', checkError);
    } else {
      console.log('Sample records after SQL update:');
      checkData.forEach(record => {
        console.log(`ID: ${record.id}, Admission Date: ${record.admission_date}, Adm Year: ${record.adm_year}`);
      });
    }
    
    // Count updated records
    const { count, error: countError } = await supabase
      .from('alumni')
      .select('*', { count: 'exact', head: true })
      .not('adm_year', 'is', null);
    
    if (countError) {
      console.error('Error counting records:', countError);
    } else {
      console.log(`Total records with adm_year populated: ${count}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the SQL update
sqlUpdateAdmYear();
