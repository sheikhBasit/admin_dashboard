# Admin Dashboard

A professional admin dashboard for managing users, mechanics, vehicles, services, feedback, analytics, and more.

## Features
- User, mechanic, vehicle, and service management
- Analytics and reporting
- Feedback and chat system
- Modern UI with Tailwind CSS and Radix UI
- API integration (FastAPI backend)

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Set environment variables:**
   - Copy `.env.example` to `.env.local` and update as needed.
3. **Run the development server:**
   ```bash
   pnpm dev
   ```
4. **Build for production:**
   ```bash
   pnpm build && pnpm start
   ```

## Folder Structure
- `app/` — Next.js app directory
- `components/` — Reusable UI components
- `hooks/` — Custom React hooks
- `lib/` — Utilities and API client
- `public/` — Static assets
- `styles/` — Global styles

## Tech Stack
- Next.js 15
- React 19
- Tailwind CSS 4
- Radix UI
- TypeScript
- FastAPI (backend)

## License
MIT
