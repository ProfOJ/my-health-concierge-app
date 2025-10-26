# Quick Start Guide - Supabase Integration

Get your app connected to Supabase in 5 minutes!

## Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com
2. Sign in or create account
3. Click "New Project"
4. Fill in:
   - **Name**: Health Concierge
   - **Database Password**: [choose a strong password]
   - **Region**: [closest to your users]
5. Click "Create new project"
6. Wait for setup to complete

## Step 2: Get Your Credentials (1 minute)

1. In your Supabase project, click **Settings** (gear icon)
2. Go to **API** section
3. Copy two values:
   - **URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

## Step 3: Configure Your App (1 minute)

1. Create `.env` file in your project root:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace with your actual values from Step 2

## Step 4: Set Up Database (1 minute)

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `supabase-schema.sql`
4. Paste into editor
5. Click **Run** (or Ctrl+Enter)
6. Wait for success message

## Step 5: Test It! (30 seconds)

1. Start your app:
```bash
bun start
```

2. Create an assistant profile through onboarding

3. Check Supabase **Table Editor** → **assistants** table
   - You should see your new profile! 🎉

## Verify Everything Works

Go through these flows to test:

### ✅ Assistant Flow
1. Complete onboarding → Check `assistants` table
2. Go live → Check `live_sessions` table
3. Go offline → See `ended_at` updated

### ✅ Sessions Flow
1. View sessions page → Should be empty initially
2. Sessions will appear when patients create requests
3. Accept a session → `status` changes to 'accepted'
4. Complete session → `invoice_amount` and `completed_at` set

### ✅ Data Persistence
1. Create some data
2. Close app completely
3. Reopen app → Data is still there!

## What's Connected?

- ✅ Assistant profiles
- ✅ Patient profiles
- ✅ Session requests
- ✅ Live/offline status
- ✅ Hospitals (8 pre-loaded)

## Troubleshooting

### Can't connect?
- Restart dev server after adding `.env`
- Check URL has `https://` prefix
- Verify anon key is complete (very long)

### No data showing?
- Open browser console for errors
- Check Supabase Table Editor for data
- Verify SQL schema ran successfully

### Still stuck?
- See `SUPABASE_SETUP.md` for detailed guide
- Check `INTEGRATION_SUMMARY.md` for architecture
- Review Supabase docs: https://supabase.com/docs

## Next Steps

Once basic connection works:

1. **Test all features** - Create profiles, sessions, go live
2. **Monitor database** - Watch Table Editor as you use app
3. **Plan authentication** - Add user sign-in for production
4. **Review security** - Update RLS policies before going live

## Files You Need

- ✅ `lib/supabase.ts` - Client config
- ✅ `lib/api.ts` - API functions  
- ✅ `contexts/AppContext.tsx` - Updated context
- ✅ `supabase-schema.sql` - Database schema
- ✅ `.env` - Your credentials (create this!)

## That's It!

Your app is now powered by Supabase. All data is stored in the cloud, persistent, and ready to scale.

Questions? Check the other documentation files:
- `SUPABASE_SETUP.md` - Detailed setup instructions
- `INTEGRATION_SUMMARY.md` - Complete technical overview
- `supabase-schema.sql` - Database structure

Happy coding! 🚀
