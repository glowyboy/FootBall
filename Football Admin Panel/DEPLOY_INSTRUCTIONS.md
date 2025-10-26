# Deploy Admin Panel to GitHub

## Step 1: Create New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `football-admin-panel`
3. Description: `Football Live Streaming Admin Panel - React + Supabase`
4. Set to Public or Private (your choice)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

## Step 2: Push to New Repository

Run these commands in the admin panel directory:

```bash
# Add the new remote repository
git remote add origin https://github.com/glowyboy/football-admin-panel.git

# Push to the new repository
git branch -M main
git push -u origin main
```

## Step 3: Verify

Your admin panel will now be available at:
https://github.com/glowyboy/football-admin-panel

## Optional: Deploy to Vercel

1. Go to https://vercel.com
2. Import your new GitHub repository
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

Your admin panel will be live and accessible via a Vercel URL.