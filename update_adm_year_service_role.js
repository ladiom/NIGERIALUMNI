import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateAdmYearWithServiceRole() {
  try {
    console.log('Starting adm_year update with service role...');
    
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
    
    // Update records in batches using service role
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
    
    // Show some sample records
    const { data: sampleRecords, error: sampleError } = await supabase
      .from('alumni')
      .select('id, admission_date, adm_year')
      .not('admission_date', 'is', null)
      .not('adm_year', 'is', null)
      .limit(5);
    
    if (sampleError) {
      console.error('Error fetching sample records:', sampleError);
    } else {
      console.log('\nSample updated records:');
      sampleRecords.forEach(record => {
        console.log(`ID: ${record.id}, Admission Date: ${record.admission_date}, Adm Year: ${record.adm_year}`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the update
updateAdmYearWithServiceRole();
