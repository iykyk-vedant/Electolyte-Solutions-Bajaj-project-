# NexScan — AI-Powered Industrial Tag & Consumption Management

NexScan is a full-stack Next.js application built for **Bajaj Auto** to digitise, track, and manage tag entries, part consumption, dispatch records, and PCB serial numbers on the shop floor. It uses **Google Gemini AI** to extract data from handwritten forms, **Supabase** for authentication, **PostgreSQL (Neon)** for persistence, and a **WebSocket server** for real-time serial-number synchronisation across connected clients.

---

## Features

| Area | Capabilities |
|---|---|
| **AI Extraction** | Upload or capture a photo of a handwritten form → Gemini extracts structured fields (branch, complaint no., product description, etc.) → review & save |
| **Tag Entry** | Create / edit / delete tag entries with auto-assigned monthly SR numbers, DC number management, PCB serial generation, and real-time sync |
| **Consumption** | Record part consumption against tag entries with BOM validation, component-level tracking, and Excel export |
| **Dispatch** | Manage dispatch records linked to tag entries |
| **Search PCB** | Look up any PCB serial number to find associated tag entry details |
| **Bulk Scrap Upload** | Upload multiple scrap PCB entries at once with atomic serial-number assignment |
| **Admin Dashboard** | Analytics on DC numbers, part codes, per-user entry counts, and consolidated data management with pagination |
| **Authentication** | Supabase-powered login/signup, forgot-password flow, role-based access (admin vs. user) |
| **Real-time Sync** | Standalone WebSocket server broadcasts SR number updates so every open client always shows the next available number |
| **Excel Export** | Export tag entries and consumption records to `.xlsx` via server-side API routes |
| **BOM Import** | Import Bills of Material from Excel/CSV/JSON for consumption validation |

---

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language** — TypeScript
- **Styling** — Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- **AI** — [Genkit](https://github.com/firebase/genkit) with `@genkit-ai/google-genai` (Gemini 2.5 Flash)
- **Auth** — [Supabase Auth](https://supabase.com/auth) (email/password, JWT)
- **Database** — PostgreSQL via [Neon](https://neon.tech/) (using `pg` driver)
- **Real-time** — Custom Node.js WebSocket server (`ws`)
- **State** — [Zustand](https://zustand-demo.pmnd.rs/), React Context
- **Forms** — React Hook Form + Zod validation
- **Charts** — Recharts
- **Firebase** — Firestore (legacy/secondary data layer)
- **Excel** — ExcelJS for import/export

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A **PostgreSQL** database (Neon recommended, or local)
- A **Supabase** project (for authentication)
- A **Google Gemini API** key — get one at [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Key variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PostgreSQL (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# App
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
JWT_SECRET=your-jwt-secret
```

See [`.env.example`](.env.example) for the full list.

### 3. Initialise the database

```bash
npm run init-db
```

This creates all required PostgreSQL tables (`consolidated_data`, `users`, `engineers`, DC numbers, BOM, etc.).

### 4. (Optional) Import Bill of Materials

```bash
npm run import-bom
```

### 5. Start development servers

A single command starts both the Next.js app and the WebSocket server concurrently:

```bash
npm run dev
```

| Service | URL |
|---|---|
| Next.js app | `http://localhost:3001` |
| WebSocket server | `ws://localhost:3002` |
| WS health check | `http://localhost:3002/health` |

> You can also start them individually with `npm run dev:next` and `npm run dev:ws`.

To run the Genkit AI development server (for testing flows in the Genkit UI):

```bash
npm run genkit:dev
```

---

## Project Structure

```
bajaj-part-2/
├── migrations/             # SQL migration scripts
├── public/                 # Static assets
├── src/
│   ├── ai/                 # Genkit AI configuration & flows
│   │   ├── flows/          # AI extraction & translation flows
│   │   ├── schemas/        # Zod schemas for AI I/O
│   │   ├── genkit.ts       # Genkit instance setup (Gemini 2.5 Flash)
│   │   └── dev.ts          # Genkit dev server entry
│   ├── app/                # Next.js App Router
│   │   ├── actions/        # Server Actions (admin, consumption, DB, images, sheets)
│   │   ├── actions.ts      # AI extraction server action
│   │   ├── api/            # API routes (auth, camera, DC numbers, engineers, export)
│   │   ├── admin/          # Admin dashboard page
│   │   ├── consumption/    # Consumption entry page
│   │   ├── dashboard/      # User dashboard (layout + page)
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── reset-password/
│   │   ├── signup/
│   │   ├── tag-entry/      # Tag entry page
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home / AI extraction page
│   │   └── globals.css     # Global styles & CSS variables
│   ├── components/
│   │   ├── tag-entry/      # Tag entry feature components
│   │   │   ├── TagEntryForm.tsx       # Main tag entry form
│   │   │   ├── TagEntryPreview.tsx    # Print-ready preview dialog
│   │   │   ├── ConsumptionTab.tsx     # Part consumption tracking
│   │   │   ├── DispatchTab.tsx        # Dispatch management
│   │   │   ├── SearchPCBTab.tsx       # PCB serial lookup
│   │   │   ├── BulkScrapTab.tsx       # Bulk scrap upload
│   │   │   ├── FindTab.tsx            # Search entries
│   │   │   ├── SettingsTab.tsx        # Entry settings
│   │   │   ├── FindPCBSection.tsx
│   │   │   ├── LockButton.tsx
│   │   │   └── StatusBar.tsx
│   │   ├── ui/             # shadcn/ui components (36 components)
│   │   ├── image-uploader.tsx
│   │   ├── sheet-overview.tsx
│   │   ├── validate-data-section.tsx
│   │   ├── validate-consumption-section.tsx
│   │   └── UserProfile.tsx
│   ├── context/            # React Context (TagEntryContext)
│   ├── contexts/           # Auth Context (Supabase session)
│   ├── firebase/           # Firebase/Firestore integration
│   ├── hooks/              # Custom hooks
│   │   ├── use-toast.ts
│   │   ├── use-mobile.tsx
│   │   └── useRealtimeSrNo.ts  # WebSocket SR No. hook
│   ├── lib/                # Utilities & services
│   │   ├── auth/           # Auth service & middleware
│   │   ├── api/            # API helper utilities
│   │   ├── tag-entry/      # Tag entry types & export utils
│   │   ├── pg-db.ts        # PostgreSQL database layer (all queries)
│   │   ├── pg-init-db.ts   # Database initialisation script
│   │   ├── pcb-utils.ts    # PCB serial number generation
│   │   ├── consumption-validation-service.ts
│   │   ├── bom-import.ts   # BOM import logic
│   │   ├── event-emitter.ts
│   │   └── ...
│   └── store/              # Zustand stores (lockStore)
├── ws-server.js            # Standalone WebSocket server for SR No. sync
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── components.json         # shadcn/ui config
└── .env.example            # Environment variable template
```

---

## Key Architecture Decisions

### Real-time SR Number Sync

A standalone WebSocket server (`ws-server.js`, port 3002) runs alongside Next.js. When a tag entry is saved, the Next.js server action calls `POST /broadcast` on the WS server, which queries PostgreSQL for the next available SR number and pushes it to all connected clients via WebSocket. The `useRealtimeSrNo` hook on the client consumes these updates.

### PCB Serial Number Generation

PCB numbers are generated using a deterministic format incorporating the DC number, part code, and current month/year. The generation logic lives in `src/lib/pcb-utils.ts`.

### Authentication Flow

Supabase handles email/password authentication. The `AuthContext` provider manages session state, and the `auth-service.ts` module handles server-side JWT verification. Password reset emails redirect through configurable URLs (`NEXT_PUBLIC_APP_URL`).

### Database Layer

All PostgreSQL queries are centralised in `src/lib/pg-db.ts` using the `pg` driver with connection pooling. Database initialisation (`npm run init-db`) creates all tables idempotently.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js + WebSocket server (development) |
| `npm run dev:next` | Start only the Next.js app |
| `npm run dev:ws` | Start only the WebSocket server |
| `npm run build` | Production build |
| `npm run start` | Start production servers |
| `npm run genkit:dev` | Start Genkit AI dev server |
| `npm run init-db` | Initialise PostgreSQL tables |
| `npm run import-bom` | Import Bill of Materials data |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

---

## Deployment

The application can be deployed on **Vercel** (Next.js) with a **Neon** PostgreSQL database and **Supabase** for auth. See [`Vercel_Deployment_Guide.md`](Vercel_Deployment_Guide.md) for detailed instructions.

For LAN deployment, configure `NEXT_PUBLIC_APP_URL` to your local domain (e.g., `https://bajaj.app.local`).

---

## License

Private — internal use only.
