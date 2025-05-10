# act-board

## Requirements

- Node.js
  - brew install node
- Supabase CLI
  - brew install supabase/tap/supabase


## How to run

1. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://app.supabase.com/project/_/settings/api)

2. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The project should now be running on [localhost:3000](http://localhost:3000/).


3. Set Up Database

   ```
   supabase link
   # select your project

   # execute migrations to your project database
   supabase db push
   ```

   Open supabase SQL Editor on browser & paste `supabase/seed.sql` & Run for insert dummy data