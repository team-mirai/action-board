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

## How to Use

1. Create new user via [local supabase studio](http://localhost:54323/).
  * Open "Authentication" menu
  * Click "Add user" button & select "Create new user"
  * Input mail address & password

2. Insert a record into the private_users table using the ID of the newly created authenticated user.
  * Open "Table Editor" menu
  * Select private_users table
  * Click "Insert" button & select  "Insert row"
  * Input "id" as the ID of the newly created authenticated user id.


## Guidelines

generate table type definition when add or update tables.

```
npx supabase gen types typescript --local > utils/types/supabase.ts
```