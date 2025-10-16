-- Nigeria Alumni Platform Database Schema

-- Create schools table
CREATE TABLE schools (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL,
  lga VARCHAR(100),
  level VARCHAR(2) NOT NULL CHECK (level IN ('PR', 'HI', 'PO', 'UN')),
  school_code VARCHAR(3) NOT NULL UNIQUE,
  founding_year INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create alumni table
CREATE TABLE alumni (
  id VARCHAR(20) PRIMARY KEY, -- Format: [SchoolCode][StateCode][Year][ClassSeq][Level]
  admission_num VARCHAR(50),
  admission_date DATE,
  title VARCHAR(50),
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  sex VARCHAR(10) CHECK (sex IN ('M', 'F', 'Male', 'Female')),
  phone_number VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  graduation_year INTEGER,
  graduation_date DATE,
  school_id BIGINT REFERENCES schools(id),
  current_position VARCHAR(255),
  current_company VARCHAR(255),
  field_of_study VARCHAR(255),
  bio TEXT,
  profile_picture VARCHAR(255),
  linkedin VARCHAR(255),
  twitter VARCHAR(255),
  facebook VARCHAR(255),
  parent_guardian_names VARCHAR(255),
  address_at_school TEXT,
  last_school_attended VARCHAR(255),
  combo_fields TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create alumni_connections table for managing connections between alumni
CREATE TABLE alumni_connections (
  id BIGSERIAL PRIMARY KEY,
  alumni_id VARCHAR(20) REFERENCES alumni(id),
  connected_alumni_id VARCHAR(20) REFERENCES alumni(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (alumni_id, connected_alumni_id)
);

-- Create events table
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  time VARCHAR(50),
  school_id BIGINT REFERENCES schools(id),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create event_registrations table
CREATE TABLE event_registrations (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES events(id),
  alumni_id VARCHAR(20) REFERENCES alumni(id),
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (event_id, alumni_id)
);

-- Create news table
CREATE TABLE news (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  date DATE NOT NULL DEFAULT NOW(),
  school_id BIGINT REFERENCES schools(id),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_alumni_school_id ON alumni(school_id);
CREATE INDEX idx_alumni_name ON alumni(full_name);
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_schools_state ON schools(state);
CREATE INDEX idx_events_school_id ON events(school_id);
CREATE INDEX idx_news_school_id ON news(school_id);

-- Add sample data
INSERT INTO schools (name, state, lga, level, school_code) VALUES
('University of Nigeria Nsukka', 'Enugu', 'Nsukka', 'UN', 'UNN'),
('Lagos High School', 'Lagos', 'Ikeja', 'HI', 'LAG'),
('Abuja Polytechnic', 'FCT', 'Abuja', 'PO', 'ABJ');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW; 
END;
$$ language 'plpgsql';

-- Triggers to update the updated_at timestamp
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON schools
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_alumni_updated_at
BEFORE UPDATE ON alumni
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON news
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Pending registrations table for email-based onboarding
CREATE TABLE IF NOT EXISTS pending_registrations (
  id BIGSERIAL PRIMARY KEY,
  alumni_id VARCHAR(20) REFERENCES alumni(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','sent','completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (alumni_id, email)
);

CREATE INDEX IF NOT EXISTS idx_pending_reg_alumni_id ON pending_registrations(alumni_id);

-- Email notifications outbox (lightweight queue for SMTP sender)
CREATE TABLE IF NOT EXISTS email_outbox (
  id BIGSERIAL PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | sent | failed
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_status ON email_outbox(status);

-- Application users table to store roles and link to alumni
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alumni_id VARCHAR(20) REFERENCES alumni(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  roles TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_alumni_id ON users(alumni_id);

-- Keep updated_at fresh on updates to users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();