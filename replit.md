# Return to Form - Ultimate Fitness Planner

## Overview

This is a comprehensive 12-week fitness transformation planner built with Next.js and React. The application provides an all-in-one platform for tracking workouts, monitoring habits, analyzing performance with AI-powered coaching insights, and documenting progress through photos and metrics. It features a sophisticated RPE (Rate of Perceived Exertion) tracking system, multiple dark themes, vision board capabilities, and detailed weekly reviews.

The application is designed for serious fitness enthusiasts who want granular control over their training program while maintaining a clean, tactical interface. It emphasizes progressive overload, recovery tracking, and data-driven decision making.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 23, 2025 - AI Coach Critical Bug Fixes**
- **FIX 1:** Panel visibility now checks for meaningful data (sets/reps/load > 0) before displaying
- **FIX 2:** Re-analysis triggers automatically when exercise data changes (sets, reps, load, RPE modified)
- **FIX 3:** Demo-to-real mode transition - auto-polling every 5 seconds detects API key addition
- Improved error handling: failed API calls don't block retries
- Added comprehensive setup instructions in README.md for ANTHROPIC_API_KEY
- Panel now disappears when exercise data is cleared (no stale analysis)
- Data signature system prevents redundant API calls while allowing dynamic updates

**November 23, 2025 - Vercel to Replit Migration**
- Migrated project from Vercel to Replit environment
- Updated package.json scripts to bind Next.js dev and production servers to port 5000 and host 0.0.0.0
- Configured workflow to run Next.js dev server with proper port and host settings
- Set up autoscale deployment configuration with pnpm build and start commands
- Installed all dependencies (320 packages) using pnpm package manager
- Application now accessible via Replit's webview interface

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14+ with App Router and React Server Components
- Client-side state management using React Context API (`use-planner` hook)
- Full client-side rendering for interactive components (`"use client"` directives throughout)
- Component-based architecture with clear separation of concerns
- Virtual scrolling via `@tanstack/react-virtual` for performance optimization with 12 weeks of daily entries

**UI Framework**: shadcn/ui component library
- Built on Radix UI primitives for accessibility
- Tailwind CSS for styling with custom CSS variables for theming
- Custom theme system with 4 pre-built themes (Dark Knight, Crimson Red, Special Ops, Arctic Blue)
- Theme colors applied via CSS custom properties and inline styles for dynamic theming

**State Management**:
- Global state managed through React Context (`PlannerProvider`)
- LocalStorage persistence for application state (`lib/storage.ts`)
- State includes: 12 weeks of training data, core metrics, vision board items, progress photos, and user preferences
- Auto-save on state changes with browser-based persistence

**Component Structure**:
- `components/planner/`: All planner-specific components
- `components/ui/`: Reusable UI components from shadcn/ui
- Main app entry at `app/page.tsx` renders `PlannerApp` component
- Layout wrapper handles theming and global UI (header, navigation)

### Data Model

**Core Types** (defined in `types/planner.tsx`):
- `PlannerState`: Root state containing weeks, metrics, photos, vision board
- `Week`: Contains 7 `DayEntry` objects plus weekly objectives and reviews
- `DayEntry`: Training exercises, habits, RPE, sleep, stress, recovery metrics
- `Exercise`: Name, sets, reps, load (kg), RPE, and notes
- `ThemeName` and `ThemeColors`: Theme configuration types

**Data Storage**:
- Browser LocalStorage with JSON serialization
- Storage key: `rtf_planner_state_v1`
- No backend database - fully client-side application
- State shape includes: program name, 12 weeks of data, core metrics (height, weight, bodyfat), vision board, progress photos

### Key Features

1. **RPE Tracking System**:
   - Per-exercise RPE (1-10 scale) with detailed descriptions
   - Session-level RPE for overall workout intensity
   - RPE calculator for estimating 1RM and training loads
   - Built-in RPE reference guide explaining each intensity level

2. **AI Coaching Analysis**:
   - Server-side analysis using Anthropic Claude API
   - Analyzes workout data to provide strength trends, form alerts, and recommendations
   - Graceful fallback to demo mode when API key unavailable
   - Located in `hooks/use-ai-coach-engine.ts` as server action

3. **Habit & Recovery Tracking**:
   - Daily habit checkboxes (water, sleep, nutrition, mobility, mindfulness, recovery)
   - Sleep hours, water intake, stress level inputs
   - Recovery metrics (soreness, energy, mood)
   - Weekly review system for reflection and planning

4. **Multi-Theme Support**:
   - 4 tactical themes with distinct color palettes
   - Real-time theme switching with CSS custom properties
   - Theme persistence in state
   - Designed for dark mode aesthetics

5. **Progress Documentation**:
   - Vision board for goal setting and motivation
   - Progress photo tracking with dates and notes
   - Core metrics tracking (height, weight, bodyfat, circumferences)
   - Weekly review system for wins, challenges, and adjustments

6. **Export Capabilities**:
   - PDF export using html2canvas and jsPDF (`lib/export-pdf.ts`)
   - Captures full planner content as multi-page PDF
   - Includes loading states and error handling
   - Scripts for alternative export methods (Playwright, Puppeteer)

### External Dependencies

**Third-Party Services**:
- **Anthropic Claude API**: AI-powered workout analysis and coaching recommendations
  - Environment variable: `ANTHROPIC_API_KEY`
  - Used in server action at `hooks/use-ai-coach-engine.ts`
  - Optional - graceful fallback to demo mode if not configured

**Deployment Platform**:
- **Vercel**: Primary hosting and deployment platform
  - Automatic deployments from repository
  - Analytics integration via `@vercel/analytics`
  - Project synced from v0.app

**UI Dependencies**:
- **Radix UI**: Headless UI primitives (dialogs, dropdowns, checkboxes, etc.)
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component library built on Radix + Tailwind

**Utility Libraries**:
- **date-fns**: Date manipulation and formatting
- **html2canvas**: HTML to canvas conversion for PDF export
- **jsPDF**: PDF generation
- **clsx** + **tailwind-merge**: Conditional CSS class handling
- **class-variance-authority**: Component variant management
- **@tanstack/react-virtual**: Virtual scrolling for performance

**Development Tools**:
- **TypeScript**: Type safety throughout application
- **Next.js**: React framework with App Router
- **Geist fonts**: Typography (Geist Sans and Geist Mono)

**Optional PDF Generation**:
- **Playwright** (scripts only): Alternative PDF generation approach
- **Puppeteer** (scripts only): Browser automation for PDF export
- Located in `scripts/` directory for offline/server-side PDF generation

**Storage**:
- Browser LocalStorage (no external database)
- Client-side only - no backend persistence required