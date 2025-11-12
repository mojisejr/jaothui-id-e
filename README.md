# Jaothui ID-Trace System

A mobile-first web application designed for Thai buffalo farmers to manage livestock through digital identification, activity tracking, and farm operations management with secure role-based access control.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)
- LINE Developers account (for OAuth)

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/mojisejr/jaothui-id-e.git
   cd jaothui-id-e
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual credentials
   ```

3. **Database Setup**
   ```bash
   npx prisma migrate dev
   npx prisma db push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

## 🌐 Vercel Deployment

### Environment Variables Setup Checklist

**Required Environment Variables for Vercel:**

#### 📊 Database Configuration
- [ ] `DATABASE_URL` - Supabase PostgreSQL connection string
  - Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA`
  - Get from: Supabase Project Settings > Database > Connection string

#### 🔐 Authentication Configuration
- [ ] `BETTER_AUTH_SECRET` - Secure random string for JWT signing
  - Generate: `openssl rand -base64 32`
  - Important: Use a different secret than development

- [ ] `BETTER_AUTH_URL` - Production URL of your deployed app
  - Format: `https://your-app.vercel.app`
  - Important: Must match your Vercel domain exactly

#### 📱 Supabase Configuration
- [ ] `SUPABASE_URL` - Supabase project URL
  - Format: `https://your-project-ref.supabase.co`
  - Get from: Supabase Project Settings > API

- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous/public key
  - Get from: Supabase Project Settings > API > Project API keys

#### 🟩 LINE OAuth Configuration
- [ ] `LINE_CLIENT_ID` - LINE Login channel ID
  - Get from: LINE Developers Console > Your Channel > Channel settings

- [ ] `LINE_CLIENT_SECRET` - LINE Login channel secret
  - Get from: LINE Developers Console > Your Channel > Channel settings

#### ⚙️ Application Configuration
- [ ] `NODE_ENV` - Set to `production` for deployed app

### Vercel Setup Steps

1. **Deploy to Vercel**
   ```bash
   # Connect your GitHub repository to Vercel
   # Or use Vercel CLI:
   vercel --prod
   ```

2. **Configure Environment Variables in Vercel**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add all the required variables from the checklist above
   - Make sure to select **Production**, **Preview**, and **Development** environments as needed

3. **LINE OAuth Redirect Configuration**
   - Go to LINE Developers Console
   - Add your Vercel URL to callback URL: `https://your-app.vercel.app/api/auth/callback/line`

4. **Supabase RLS Policies** (if not already configured)
   - Ensure Row Level Security policies are properly set up
   - Test API access with your Supabase configuration

5. **Redeploy After Environment Setup**
   ```bash
   vercel --prod
   ```

### Verification Checklist

After deployment, verify:

- [ ] App loads at `https://your-app.vercel.app`
- [ ] Database connection works (check logs for any DATABASE_URL errors)
- [ ] LINE OAuth redirects correctly
- [ ] Authentication flow completes successfully
- [ ] Supabase storage access (if using file uploads)
- [ ] No console errors related to missing environment variables

### Troubleshooting

**Common Issues:**

1. **DATABASE_URL Connection Failed**
   - Verify Supabase database is active
   - Check connection string format
   - Ensure IP addresses are allowed in Supabase settings

2. **LINE OAuth Redirect Error**
   - Verify callback URL matches exactly in LINE Developers Console
   - Check `BETTER_AUTH_URL` environment variable
   - Ensure LINE app is in production mode

3. **Supabase Access Denied**
   - Verify RLS policies are correctly configured
   - Check `SUPABASE_ANON_KEY` is correct
   - Test with Supabase client directly

4. **Build Failures**
   - Check all required environment variables are set
   - Verify `NODE_ENV=production` in production
   - Review Vercel build logs for specific errors

## 📚 Technology Stack

- **Frontend**: React, Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Authentication**: better-auth with LINE OAuth
- **Deployment**: Vercel
- **Storage**: Supabase Storage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
