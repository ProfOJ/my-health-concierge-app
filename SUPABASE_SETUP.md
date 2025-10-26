# Supabase Setup Guide

This guide will help you set up Supabase for your Health Concierge application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com if you don't have one)
- Node.js and npm/bun installed
- Access to your project repository

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Health Concierge (or your preferred name)
   - **Database Password**: Choose a strong password (save this securely)
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Select Free tier for development
4. Click "Create new project"
5. Wait for your project to be set up (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. Once your project is ready, go to **Project Settings** (gear icon in the left sidebar)
2. Navigate to the **API** section
3. You'll need two values:
   - **Project URL**: Copy the URL (it looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key**: Copy the `anon` key (this is your public API key)

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add the following environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace the values with your actual Supabase URL and anon key from Step 2
4. **Important**: Add `.env` to your `.gitignore` file to avoid committing secrets

## Step 4: Set Up the Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor** (in the left sidebar)
2. Click "New Query"
3. Copy the contents of `supabase-schema.sql` from your project
4. Paste it into the SQL Editor
5. Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
6. Wait for the query to complete. You should see a success message.

This will create all the necessary tables, indexes, triggers, and policies.

## Step 5: Verify Database Setup

1. Go to the **Table Editor** in your Supabase dashboard
2. You should see the following tables:
   - `hospitals` (with 8 sample hospitals already inserted)
   - `assistants`
   - `patients`
   - `sessions`
   - `live_sessions`
   - `session_media`

## Step 6: Test Your Connection

1. Start your development server:
   ```bash
   bun start
   ```

2. The app will now connect to Supabase for all data operations
3. When you create an assistant or patient profile, the data will be stored in Supabase
4. Check your Supabase dashboard's Table Editor to see the data being created

## Database Schema Overview

### Tables

#### `hospitals`
Stores hospital information
- `id`: UUID (Primary Key)
- `name`: Hospital name
- `location`: Address
- `city`: City name
- `created_at`: Timestamp

#### `assistants`
Stores health assistant profiles
- `id`: UUID (Primary Key)
- `name`, `email`, `phone`, `address`: Contact information
- `photo`, `id_photo`: Image URLs
- `role`: Healthcare role
- `services`: Array of services offered
- `pricing_model`: 'fixed' | 'hourly' | 'bespoke'
- `rate`, `rate_min`, `rate_max`: Pricing information
- `verification_status`: 'verified' | 'pending' | 'rejected'
- `created_at`, `updated_at`: Timestamps

#### `patients`
Stores patient profiles
- `id`: UUID (Primary Key)
- `name`, `contact`, `location`: Basic information
- `is_patient`: Boolean
- `has_insurance`, `insurance_provider`, `insurance_number`: Insurance details
- `has_card`, `card_photo`, `card_details`: Card information
- `id_photo`: ID image URL
- `created_at`, `updated_at`: Timestamps

#### `sessions`
Stores session requests and details
- `id`: UUID (Primary Key)
- `patient_id`: Foreign key to patients table
- `assistant_id`: Foreign key to assistants table
- `hospital_id`: Foreign key to hospitals table
- `status`: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'declined'
- Patient and requester information
- `invoice_amount`, `invoice_review`: Payment details
- Various timestamps

#### `live_sessions`
Tracks when assistants are live and available
- `id`: UUID (Primary Key)
- `assistant_id`: Foreign key to assistants table
- `hospital_id`: Foreign key to hospitals table
- `from_date`, `from_time`, `to_date`, `to_time`: Availability schedule
- `started_at`, `ended_at`: Session timestamps
- `offline_notes`: Notes when going offline

#### `session_media`
Stores media files associated with sessions
- `id`: UUID (Primary Key)
- `session_id`: Foreign key to sessions table
- `uri`: File URL
- `type`: Media type
- `created_at`: Timestamp

## Security Notes

### Row Level Security (RLS)

The database is configured with Row Level Security enabled. The current policies allow public access for development purposes. 

**For production**, you should:

1. Implement proper authentication using Supabase Auth
2. Update RLS policies to restrict access based on authenticated users
3. Example policy for assistants:
   ```sql
   CREATE POLICY "Users can only update their own profile"
   ON public.assistants FOR UPDATE
   USING (auth.uid() = id);
   ```

### API Keys

- The **anon key** is safe to use in client-side code
- Never expose your **service_role key** in client code
- The anon key respects RLS policies
- Keep your database password secure

## API Usage

The app uses Axios with Supabase REST API. Here's how data flows:

1. **Creating Data**: 
   - `assistantApi.create()` → POST to `/assistants`
   - `patientApi.create()` → POST to `/patients`
   - `sessionApi.create()` → POST to `/sessions`

2. **Reading Data**:
   - `assistantApi.getAll()` → GET from `/assistants`
   - `sessionApi.getByAssistant(id)` → GET from `/sessions?assistant_id=eq.{id}`

3. **Updating Data**:
   - `assistantApi.update(id, data)` → PATCH to `/assistants?id=eq.{id}`
   - `sessionApi.update(id, data)` → PATCH to `/sessions?id=eq.{id}`

4. **Live Sessions**:
   - `liveSessionApi.create()` → POST to `/live_sessions`
   - `liveSessionApi.end()` → PATCH to `/live_sessions`

## Troubleshooting

### Connection Issues
- Verify your `.env` file has the correct URL and key
- Restart your development server after adding environment variables
- Check the Network tab in browser dev tools for API errors

### Database Errors
- Review the SQL execution log in Supabase dashboard
- Ensure all tables were created successfully
- Check for any foreign key constraint violations

### RLS Policy Issues
- If you get "permission denied" errors, check your RLS policies
- For development, you can temporarily disable RLS on specific tables:
  ```sql
  ALTER TABLE public.table_name DISABLE ROW LEVEL SECURITY;
  ```

### Data Not Appearing
- Open Supabase Table Editor to verify data is being stored
- Check browser console for any API errors
- Verify the API requests in the Network tab

## Next Steps

After setup is complete:

1. Test creating an assistant profile through the app
2. Verify the data appears in Supabase Table Editor
3. Test creating sessions and going live
4. Monitor the database for any issues
5. Plan your authentication strategy for production

## Support

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- PostgREST API Reference: https://postgrest.org/en/stable/api.html

## Production Checklist

Before deploying to production:

- [ ] Set up proper authentication with Supabase Auth
- [ ] Update RLS policies for security
- [ ] Set up database backups
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and alerts
- [ ] Review and optimize database indexes
- [ ] Implement rate limiting
- [ ] Set up proper error logging
- [ ] Create a staging environment
- [ ] Test all critical user flows
- [ ] Set up CI/CD for database migrations
