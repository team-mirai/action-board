# act-board

## Requirements

- Node.js
  - brew install node
- Docker  
- Supabase CLI
  - brew install supabase/tap/supabase


## How to run

1. Start supabase local env

   ```bash
   supabase start
   ```

1. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY WHICH SHOWED AFTER `supabase start`]
   ```

2. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The project should now be running on [localhost:3000](http://localhost:3000/).


3. Set Up Local Database

   ```
   supabase db reset
   ```

## Guidelines

generate table type definition when add or update tables.

```
npx supabase gen types typescript --local > utils/types/supabase.ts
```