import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to parse date from various formats
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'Missing' || dateStr.trim() === '') {
    return null;
  }
  
  // Handle formats like "20-Jan-1962", "25-Sep-1947", etc.
  const dateMatch = dateStr.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    const monthMap = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    return `${year}-${monthMap[month]}-${day.padStart(2, '0')}`;
  }
  
  return null;
}

// Function to generate alumni ID for St. Patrick's Grammar School
function generateAlumniId(admissionNum, year = '1962', level = 'HI') {
  const schoolCode = 'SPA'; // St. Patrick's Grammar School
  const stateCode = 'OY'; // Oyo State
  const classSeq = admissionNum.toString().padStart(3, '0');
  return `${schoolCode}${stateCode}${year}${classSeq}${level}`;
}

// Function to process the data file
async function importStPatricksData() {
  try {
    console.log('📚 Importing St. Patrick\'s Grammar School Ibadan data...');
    console.log('🏫 School ID: 9');
    
    const data = fs.readFileSync('SpacoRegistryTo_databse.txt', 'utf8');
    const lines = data.split('\n');
    
    console.log(`Found ${lines.length} lines in the file`);
    
    // Skip header line
    const dataLines = lines.slice(1).filter(line => line.trim() !== '');
    console.log(`Processing ${dataLines.length} data records...`);
    
    const alumniRecords = [];
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const columns = line.split('\t');
      
      if (columns.length < 20) {
        console.log(`Skipping line ${i + 2}: insufficient columns (${columns.length})`);
        continue;
      }
      
      const [
        id,
        admissionNum,
        adminDate,
        fullName,
        dob,
        sex,
        profilePicture,
        bio,
        fieldOfStudy,
        phoneNumber,
        email,
        linkedin,
        twitter,
        facebook,
        currentPosition,
        currentCompany,
        parentGuardNames,
        note,
        addressAtSchool,
        lastSchoolAttended,
        graduationDate,
        comboFields
      ] = columns;
      
      // Skip if essential data is missing
      if (!fullName || fullName.trim() === '' || fullName === 'Missing') {
        console.log(`Skipping record ${i + 2}: missing full name`);
        continue;
      }
      
      const alumniId = generateAlumniId(admissionNum);
      
      const alumniRecord = {
        id: alumniId,
        admission_num: admissionNum || null,
        admission_date: parseDate(adminDate),
        full_name: fullName.trim(),
        date_of_birth: parseDate(dob),
        sex: sex === 'M' ? 'M' : (sex === 'F' ? 'F' : null),
        phone_number: phoneNumber && phoneNumber !== 'Missing' ? phoneNumber.trim() : null,
        email: email && email !== 'Missing' ? email.trim() : null,
        graduation_date: parseDate(graduationDate),
        graduation_year: parseDate(graduationDate) ? new Date(parseDate(graduationDate)).getFullYear() : null,
        current_position: currentPosition && currentPosition !== 'Missing' ? currentPosition.trim() : null,
        current_company: currentCompany && currentCompany !== 'Missing' ? currentCompany.trim() : null,
        field_of_study: fieldOfStudy && fieldOfStudy !== 'Missing' ? fieldOfStudy.trim() : null,
        bio: bio && bio !== 'Missing' ? bio.trim() : null,
        profile_picture: profilePicture && profilePicture !== 'Missing' ? profilePicture.trim() : null,
        linkedin: linkedin && linkedin !== 'Missing' ? linkedin.trim() : null,
        twitter: twitter && twitter !== 'Missing' ? twitter.trim() : null,
        facebook: facebook && facebook !== 'Missing' ? facebook.trim() : null,
        parent_guardian_names: parentGuardNames && parentGuardNames !== 'Missing' ? parentGuardNames.trim() : null,
        address_at_school: addressAtSchool && addressAtSchool !== 'Missing' ? addressAtSchool.trim() : null,
        last_school_attended: lastSchoolAttended && lastSchoolAttended !== 'Missing' ? lastSchoolAttended.trim() : null,
        combo_fields: comboFields && comboFields !== 'Missing' ? comboFields.trim() : null,
        school_id: 9 // St. Patrick's Grammar School Ibadan
      };
      
      alumniRecords.push(alumniRecord);
      
      if (i % 100 === 0) {
        console.log(`Processed ${i + 1} records...`);
      }
    }
    
    console.log(`\nPrepared ${alumniRecords.length} alumni records for import`);
    
    // Insert records in batches
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < alumniRecords.length; i += batchSize) {
      const batch = alumniRecords.slice(i, i + batchSize);
      
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)...`);
      
      const { data: insertedData, error } = await supabase
        .from('alumni')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        continue;
      }
      
      successCount += batch.length;
      console.log(`✅ Successfully inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`);
    }
    
    console.log(`\n🎉 Import completed!`);
    console.log(`📊 Successfully imported ${successCount} out of ${alumniRecords.length} records`);
    console.log(`🏫 All records linked to St. Patrick's Grammar School Ibadan (School ID: 9)`);
    
  } catch (error) {
    console.error('Error importing data:', error);
  }
}

// Run the import
importStPatricksData();
