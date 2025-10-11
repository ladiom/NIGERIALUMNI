# Supabase RLS Policies for 100NAIRA Platform

This document explains the Row Level Security (RLS) policies defined in `supabase_policies.sql` and how to apply them to your 100NAIRA Platform Supabase database.

## Overview

The policies in this file provide a comprehensive security framework for the 100NAIRA Platform, including:

- Public read access to certain data (schools, events, news)
- User-specific permissions (update own profile)
- Authentication requirements for sensitive operations
- Optional admin access controls

## How to Apply These Policies

1. Open your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Copy and paste the SQL from `supabase_policies.sql` into the editor
4. Click **Run** to apply all policies

## Policy Details

### Schools Table Policies
- **Public schools are viewable by everyone**: Allows anyone to view school information
- **Authenticated users can create schools**: Allows logged-in users to add new schools
- **School administrators can update schools**: Restricts school updates to admin users

### Alumni Table Policies
- **Public can search alumni with limited data**: Allows public to search for alumni
- **Authenticated users can view full alumni profiles**: Logged-in users get full profile access
- **Users can update their own profile**: Each user can only modify their own information
- **Authenticated users can create alumni records**: Logged-in users can register as alumni

### Alumni Connections Table Policies
- **Users can manage their own connections**: Users can view and manage their own network connections

### Events Table Policies
- **Public events are viewable by everyone**: Allows anyone to browse upcoming events
- **Authenticated users can create events**: Logged-in users can organize new events

### Event Registrations Table Policies
- **Users can register for events**: Logged-in users can sign up for events
- **Users can view their own registrations**: Users can see which events they're registered for

### News Table Policies
- **Public news are viewable by everyone**: Allows anyone to read school news and announcements
- **Authenticated users can create news**: Logged-in users can publish news items

## Optional Enhancements

The policy file includes commented-out sections for additional security features you may want to implement:

1. **Event creator policies**: Add a `creator_id` column to the `events` table and uncomment the policy to allow only creators to modify their events

2. **News creator policies**: Add a `creator_id` column to the `news` table and uncomment the policy to allow only creators to modify their news articles

## Working with Authentication

These policies work with Supabase Auth to identify users. The key functions used are:

- `auth.uid()`: Returns the unique ID of the currently authenticated user
- `auth.role()`: Returns the role of the current user (e.g., 'authenticated', 'anon', 'admin')

## Testing the Policies

After applying the policies, you should test them thoroughly to ensure they behave as expected:

1. Try accessing data as an anonymous user
2. Try accessing and modifying data as an authenticated user
3. If you've set up admin users, test admin-specific operations

## Troubleshooting

If you encounter issues with the policies:

- Make sure RLS is enabled for all tables
- Check that your authentication system is working correctly
- Review the policy conditions to ensure they match your intended access control rules
- Use the Supabase logs to debug any permission errors

For more information, refer to the [Supabase RLS documentation](https://supabase.com/docs/guides/auth/row-level-security)