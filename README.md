# Sonkkens Inventory System

A minimalist inventory management app built with React, Vite, and Supabase.

## Features

- Supabase Auth protected login
- Dashboard with product search and details
- IN product creation with automatic barcode generation
- OUT product removal with confirmation and activity logging
- Profile updates for email, password, and display name
- Download product details as image

## Requirements

- Node.js 18+
- Supabase project with Auth and Database

## Setup

1. Clone or open this folder.
2. Install dependencies:

```bash
npm install
```

3. Create a Supabase project.
4. Add the database tables using `supabase_setup.sql`.
5. Create one Auth user in Supabase. Recommended values:
   - Email: `stockcontroller@inventory.local`
   - Password: `StrongPassword123!`
   - Display name or `user_metadata.name`: `stock controller`
6. Create a `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

7. Fill in your Supabase values in `.env.local`.
8. Run the app:

```bash
npm run dev
```

## Supabase Setup

1. In Supabase, open the SQL editor and run the SQL in `supabase_setup.sql`.
2. Enable Auth for email/password sign-in.
3. In the Supabase dashboard, create a single user with:
   - Email: `stockcontroller@inventory.local`
   - Password: `StrongPassword123!`
   - Display name: `stock controller`
4. Confirm the user uses `name` in user metadata if required.
5. The app requires only one authenticated user and will block other accounts.

## Environment Variables

Set these values in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

- `products`
- `activity_logs`

## Notes

- The app expects one inventory user account with display name `stock controller`.
- Barcode values are generated automatically for IN products.
