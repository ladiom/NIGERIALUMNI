# Nigeria Alumni Platform (NAIRA-100) - Setup Guide

## Current Status
✅ **Application is running successfully on http://localhost:5173**
✅ **PhoneInput component is working and integrated**
✅ **Database schema is properly defined**
✅ **Authentication system is implemented**

## What's Working
- React application with Vite build system
- Supabase integration for database and authentication
- PhoneInput component with country selection
- Alumni search and registration functionality
- School selection and management
- User authentication and profile management

## Setup Instructions

### 1. Environment Configuration
The application requires Supabase credentials to function properly. Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Database Setup
Run the SQL schema from `supabase_schema.sql` in your Supabase project to create the necessary tables.

### 3. Development Server
The application is currently running on port 5173. To restart:
```bash
npm run dev
```

## Key Features
- **Alumni Search**: Search by name, school, state, graduation year
- **School Registration**: Register new schools and alumni
- **Phone Input**: International phone number input with country selection
- **User Authentication**: Secure login/registration with Supabase Auth
- **Admin Panel**: Manage pending registrations and user accounts

## Next Steps
The application is ready for use. You can:
1. Set up your Supabase project credentials
2. Test the registration and search functionality
3. Customize the styling and branding
4. Deploy to production

## File Structure
- `src/components/` - Reusable UI components
- `src/pages/` - Main application pages
- `src/context/` - React context for state management
- `src/services/` - External service integrations
- `supabase_schema.sql` - Database schema
