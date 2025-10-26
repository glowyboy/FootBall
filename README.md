# Football Live Admin Panel

A modern React-based admin panel for managing football live streaming app content, ads, and notifications.

## Features

- **Match Management**: Add, edit, and manage football matches
- **Channel Management**: Organize streaming channels and categories
- **Ad Configuration**: Configure ad networks (AdMob, Start.io, etc.)
- **Push Notifications**: Send notifications to app users
- **Real-time Updates**: Live data synchronization with Supabase

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Icons**: Lucide React

## Setup

1. Clone the repository:
```bash
git clone https://github.com/glowyboy/football-admin-panel.git
cd football-admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

## Deployment

The admin panel can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

```bash
npm run build
```

## Configuration

### Supabase Setup

Make sure your Supabase database has the following tables:
- `matches`
- `channels` 
- `categories`
- `ads_settings`
- `notifications`

### Ad Networks

The admin panel supports configuration for:
- Google AdMob
- Start.io
- Meta Audience Network
- Unity Ads

## License

MIT License