# TunnelTech Blog — Setup & Deployment Guide

## Step 1: Install Node.js

Download and install Node.js (LTS version) from: https://nodejs.org
After installing, open a new terminal and verify:
```
node --version
npm --version
```

## Step 2: Install dependencies

Open a terminal in the `tunnel-blog` folder and run:
```
npm install
```

## Step 3: Set up Supabase (free)

1. Go to https://supabase.com and create a free account
2. Click "New Project" → give it a name (e.g. `tunnel-blog`) → choose a password → select the closest region
3. Once created, go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public** key
   - **service_role** key (keep this secret)

4. Run the database schema:
   - Go to **SQL Editor** in Supabase dashboard
   - Click **New query**
   - Paste the entire contents of `supabase/schema.sql`
   - Click **Run** (green button)

5. Create your admin user:
   - Go to **Authentication → Users** in Supabase dashboard
   - Click **Add user** → Enter your email and a strong password
   - This is your login for the admin panel

## Step 4: Configure environment variables

Copy `.env.local.example` to `.env.local`:
```
copy .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 5: Run locally

```
npm run dev
```

Open http://localhost:3000 — you should see the blog!
Admin panel: http://localhost:3000/login

## Step 6: Deploy to Vercel (free)

1. Create a free account at https://github.com and push your code:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   ```
   Then create a new repo on GitHub and push.

2. Go to https://vercel.com and sign in with GitHub
3. Click **Add New → Project** → select your repo
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → set to your Vercel URL (e.g. `https://tunnel-blog.vercel.app`)
5. Click **Deploy**

Your blog is now live at `https://your-project.vercel.app`!

## Supabase Auth configuration

After deploying to Vercel, update Supabase:
1. Go to **Authentication → URL Configuration** in Supabase
2. Set **Site URL** to your Vercel URL
3. Add your Vercel URL to **Redirect URLs**

## What's included

| Feature | Where |
|---|---|
| Public blog with infinite scroll | `/blog` |
| Post detail with comments | `/blog/[slug]` |
| Category pages | `/category/[slug]` |
| Tag pages | `/tag/[slug]` |
| Full-text search | `/search` |
| Newsletter signup | Footer + post sidebar |
| Admin login | `/login` |
| Admin dashboard | `/admin` |
| Create/edit posts | `/admin/posts/new`, `/admin/posts/[id]/edit` |
| Rich text editor (TipTap) | Post editor |
| Comment moderation | `/admin/comments` |
| Category management | `/admin/categories` |
| Newsletter subscribers | `/admin/newsletter` |

## Customization

- **Site name**: Search for `TunnelTech` in the codebase and replace
- **Default categories**: Edit the seed data at the bottom of `supabase/schema.sql`
- **Theme colors**: Edit `tailwind.config.ts` under `colors.signal`
- **Hero text**: Edit `src/app/(public)/page.tsx`
