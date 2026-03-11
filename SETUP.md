# Training Partner - Setup & Deployment Guide

## Overview

Training Partner is a two-sided marketplace platform connecting combat sports athletes with compatible training partners and partner gyms offering open mat hours.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Next.js 14 |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Data Storage | LocalStorage (MVP) / Supabase (Production) |
| Hosting | Vercel (Free) |
| Payments | Lemon Squeezy (Ready for integration) |

## Project Structure

```
training-partner/
├── src/
│   └── app/
│       ├── page.tsx              # Landing page
│       ├── layout.tsx            # Root layout
│       ├── globals.css           # Global styles
│       ├── auth/
│       │   ├── signup/page.tsx   # Sign up page
│       │   └── signin/page.tsx   # Sign in page
│       ├── app/
│       │   ├── layout.tsx        # App layout with sidebar
│       │   ├── page.tsx          # Dashboard
│       │   ├── profile/page.tsx  # Profile editing
│       │   ├── partners/page.tsx # Partner matching
│       │   ├── gyms/page.tsx     # Gym listings
│       │   └── settings/page.tsx # Settings
│       ├── terms/page.tsx        # Terms of Service
│       └── privacy/page.tsx      # Privacy Policy
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── SPEC.md
```

## Features Implemented

### ✅ Completed Features

1. **Landing Page**
   - Hero section with stats
   - Features section
   - How it works
   - Sports showcase
   - Pricing tiers (Free + $20 Premium)
   - Call-to-action sections
   - Footer with navigation

2. **Authentication**
   - Sign up with email, password, sport selection
   - Sign in with validation
   - Terms acceptance
   - LocalStorage session management

3. **User Profile**
   - Basic info (name, email, age, location)
   - Multi-sport selection
   - Skill level selection
   - Weight class selection
   - Training goals (multi-select)
   - Weekly availability grid
   - Bio section

4. **Partner Matching**
   - Searchable partner list
   - Filter by sport and skill level
   - Match score algorithm (visual)
   - Partner detail modal
   - Message button (UI ready)

5. **Gym Listings**
   - Partner gym cards
   - Verified gym badges
   - Open mat hours display
   - Premium gym locking
   - Gym detail modal
   - Booking UI

6. **Settings**
   - Account settings
   - Notification preferences
   - Subscription management (UI)
   - Privacy controls
   - Billing section

7. **Legal Pages**
   - Terms of Service (with liability waiver)
   - Privacy Policy

## Design System

### Colors
- Primary: `#FF4D00` (Fierce Orange)
- Secondary: `#1A1A1A` (Dark Gray)
- Accent: `#00FF88` (Electric Green)
- Background: `#0D0D0D` (Deep Black)
- Surface: `#1F1F1F` (Card backgrounds)

### Typography
- Headings: Bebas Neue
- Body: DM Sans
- Mono: JetBrains Mono

## Deployment Instructions

### Option 1: Vercel (Recommended - Free)

1. **Push code to GitHub**
   ```bash
   cd training-partner
   git init
   git add .
   git commit -m "Initial commit: Training Partner platform"
   # Create a new repository on GitHub and push
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Your site will be live at** `https://your-project.vercel.app`

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   cd training-partner
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open** `http://localhost:3000`

### Option 3: Build for Production

```bash
npm run build
npm start
```

## Future Enhancements (For Milo to Implement)

### Phase 2: Real Backend
- [ ] Set up Supabase account (free tier)
- [ ] Create PostgreSQL database
- [ ] Add user authentication with Supabase Auth
- [ ] Replace localStorage with Supabase database

### Phase 3: Payments
- [ ] Create Lemon Squeezy account
- [ ] Add payment integration
- [ ] Implement subscription management

### Phase 4: Mobile Apps
- [ ] Use React Native or Expo
- [ ] Build iOS and Android apps
- [ ] Push notifications

### Phase 5: Gym Revenue Share
- [ ] Gym dashboard for managing open mat
- [ ] Revenue tracking system
- [ ] Automated payouts

## User Flows

### Athlete Flow
1. Visit landing page → Click "Get Started"
2. Sign up with email → Create profile
3. Complete profile (sports, skill, goals)
4. Browse/search partners
5. View partner details → Send message
6. (Premium) Access gym open mat hours
7. Book gym session

### Gym Owner Flow
1. Contact us to add gym
2. Create gym profile
3. List open mat hours
4. Receive member bookings
5. Get revenue share

## Support & Maintenance

- **Bug Reports**: Create issues on GitHub
- **Features**: Prioritize based on user feedback
- **Analytics**: Add Google Analytics or Plausible

## License

This is a proprietary project. All rights reserved.

---

**Built by OpenClo AI Assistant for Milo**
*February 28, 2026*
