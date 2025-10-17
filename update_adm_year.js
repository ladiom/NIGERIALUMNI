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

async function updateAdmYear() {
  try {
    console.log('Starting adm_year update process...');
    
    // First, let's check how many records need updating
    const { count, error: countError } = await supabase
      .from('alumni')
      .select('*', { count: 'exact', head: true })
      .not('admission_date', 'is', null)
      .is('adm_year', null);
    
    if (countError) {
      console.error('Error counting records:', countError);
      return;
    }
    
    console.log(`Found ${count} records with admission_date but no adm_year`);
    
    if (count === 0) {
      console.log('No records need updating');
      return;
    }
    
    // Get all records that need updating (in batches)
    const batchSize = 100;
    let offset = 0;
    let totalUpdated = 0;
    
    while (offset < count) {
      console.log(`Processing batch: ${offset + 1} to ${Math.min(offset + batchSize, count)}`);
      
      const { data: records, error: fetchError } = await supabase
        .from('alumni')
        .select('id, admission_date')
        .not('admission_date', 'is', null)
        .is('adm_year', null)
        .range(offset, offset + batchSize - 1);
      
      if (fetchError) {
        console.error('Error fetching records:', fetchError);
        break;
      }
      
      if (!records || records.length === 0) {
        break;
      }
      
      // Process each record
      for (const record of records) {
        if (record.admission_date) {
          const admissionYear = new Date(record.admission_date).getFullYear();
          
          const { error: updateError } = await supabase
            .from('alumni')
            .update({ adm_year: admissionYear })
            .eq('id', record.id);
          
          if (updateError) {
            console.error(`Error updating record ${record.id}:`, updateError);
          } else {
            totalUpdated++;
            if (totalUpdated % 50 === 0) {
              console.log(`Updated ${totalUpdated} records so far...`);
            }
          }
        }
      }
      
      offset += batchSize;
    }
    
    console.log(`Successfully updated ${totalUpdated} records`);
    
    // Verify the update
    const { count: updatedCount, error: verifyError } = await supabase
      .from('alumni')
      .select('*', { count: 'exact', head: true })
      .not('admission_date', 'is', null)
      .not('adm_year', 'is', null);
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log(`Verification: ${updatedCount} records now have adm_year populated`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the update
updateAdmYear();
