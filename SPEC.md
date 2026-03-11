# Training Partner - Platform Specification

## Project Overview
- **Name:** Training Partner
- **Type:** Two-sided marketplace web application
- **Core Functionality:** Connect combat sports athletes with compatible training partners AND provide access to partner gyms with exclusive "Open Mat" hours
- **Target Users:** Wrestlers, MMA fighters, BJJ practitioners, boxers, and combat sports enthusiasts

## Architecture
- **Frontend:** React + Next.js + Tailwind CSS
- **Backend:** Next.js API routes (serverless)
- **Database:** In-memory store (for MVP) / SQLite (production-ready)
- **Auth:** Email-based with optional crypto wallet
- **Hosting:** Vercel (free tier)
- **Payments:** Lemon Squeezy integration ready

## UI/UX Specification

### Color Palette
- **Primary:** #FF4D00 (Fierce Orange - energy, combat)
- **Secondary:** #1A1A1A (Near Black - dark mode base)
- **Accent:** #00FF88 (Electric Green - success, energy)
- **Background:** #0D0D0D (Deep Black)
- **Surface:** #1F1F1F (Card backgrounds)
- **Text Primary:** #FFFFFF
- **Text Secondary:** #A0A0A0
- **Border:** #333333

### Typography
- **Headings:** "Bebas Neue" (bold, athletic)
- **Body:** "DM Sans" (clean, modern)
- **Monospace:** "JetBrains Mono" (for stats/numbers)

### Layout
- **Max Width:** 1280px centered
- **Spacing:** 4px base unit
- **Border Radius:** 8px (cards), 4px (buttons), 9999px (pills)

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Page Structure

### 1. Landing Page (/)
- Hero section with tagline
- Feature highlights (3 cards)
- How it works (3 steps)
- Call to action (Sign Up)
- Footer with links

### 2. App Dashboard (/app)
- Navigation sidebar
- User stats overview
- Quick actions
- Recent matches
- Nearby gyms

### 3. Profile Page (/app/profile)
- Edit personal info
- Sports selection (multi-select)
- Skill level slider
- Weight class selector
- Training goals
- Location (city/area)
- Profile photo placeholder

### 4. Partner Matching (/app/partners)
- Search/filter panel
- Match cards grid
- Match score indicator
- Contact/message buttons

### 5. Gyms Page (/app/gyms)
- Partner gym listings
- Open mat hours
- Location map
- Subscription status

### 6. Auth Pages (/auth)
- Sign In
- Sign Up
- Password reset

## Core Features

### User Profile
- Email registration
- Name, age, location
- Combat sports (wrestling, MMA, BJJ, boxing, jiu-jitsu, etc.)
- Skill level (Beginner, Intermediate, Advanced, Pro)
- Weight class (Flyweight to Heavyweight)
- Training goals (Competition, Fitness, Self-defense, Technique)
- Experience years
- Availability (days/times)

### Partner Matching Algorithm
- Weight class proximity (±10 lbs)
- Skill level matching
- Sport overlap
- Location radius (25 miles default)
- Training goal compatibility

### Gym System
- Gym profile (name, address, sports, amenities)
- Open mat hours scheduling
- Subscription pricing display
- Verification badge

### Subscription Flow
- Free tier: Basic partner matching
- $20/mo: Access to partner gyms' open mat
- Gym revenue share tracking

## Data Models

### User
```typescript
{
  id: string
  email: string
  name: string
  age: number
  location: string
  sports: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro'
  weightClass: string
  trainingGoals: string[]
  experienceYears: number
  availability: DayTime[]
  profileImage: string
  createdAt: Date
}
```

### Gym
```typescript
{
  id: string
  name: string
  address: string
  city: string
  sports: string[]
  amenities: string[]
  openMatHours: OpenMatSlot[]
  subscriptionPrice: number
  verified: boolean
}
```

### Match
```typescript
{
  userId: string
  matchedUserId: string
  matchScore: number
  matchedAt: Date
}
```

## Acceptance Criteria

### Must Work
- [x] Landing page loads with hero and features
- [x] User can sign up with email
- [x] User can create/edit profile
- [x] Partner matching shows relevant results
- [x] Gym listings display with open mat times
- [x] Dark mode UI throughout
- [x] Mobile responsive
- [x] Fast page loads

### Visual Quality
- [x] Professional, modern combat sports aesthetic
- [x] Consistent spacing and typography
- [x] Smooth animations on interactions
- [x] Clear call-to-action buttons
- [x] Readable text on dark backgrounds

### Technical
- [x] No console errors
- [x] All links work
- [x] Forms validate properly
- [x] API routes respond correctly
- [x] Database persists data

## External Resources
- Fonts: Google Fonts (Bebas Neue, DM Sans, JetBrains Mono)
- Icons: Lucide React
- Images: Unsplash (combat sports photos)
- Colors: Tailwind CSS custom config
