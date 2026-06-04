# NexScan Codebase Command Reference

This file documents all the commands and scripts available in the NexScan codebase, explaining what they do, their corresponding source files, and how to run them.

---

## 🚀 Development & Running the App

These commands are used to start the development servers, run real-time synchronization, or run production environments.

### 1. Run Development Server (All-in-one)
Starts both the Next.js frontend (on port `3001` with Turbopack) and the WebSocket server (on port `3002`) concurrently.
* **Command:**
  ```bash
  npm run dev
  ```
* **Executed command:** `concurrently "next dev --turbopack -p 3001" "node ws-server.js"`

### 2. Run Next.js Frontend Only
Starts only the Next.js dev server on port `3001`.
* **Command:**
  ```bash
  npm run dev:next
  ```
* **Executed command:** `next dev --turbopack -p 3001`

### 3. Run WebSocket Server Only
Starts only the standalone WebSocket server that handles real-time SR number synchronization.
* **Command:**
  ```bash
  npm run dev:ws
  ```
* **Executed command:** `node ws-server.js`
* **Under the hood:** [ws-server.js](file:///d:/bajaj-1/bajaj-part-2/ws-server.js)

### 4. Build for Production
Compiles the Next.js application, generating production optimized assets.
* **Command:**
  ```bash
  npm run build
  ```
* **Executed command:** `next build`

### 5. Start Production Server
Runs the production build of Next.js and the WebSocket server concurrently.
* **Command:**
  ```bash
  npm run start
  ```
* **Executed command:** `concurrently "next start -p ${PORT:-3000}" "node ws-server.js"`

---

## 🗄️ Database & Schema Initialization

Commands for setting up the PostgreSQL database and managing data.

### 1. Initialize PostgreSQL Database
Creates all required tables (`bom`, `dc_numbers`, `consolidated_data`, `users`, `engineers`, `sheets`), updates constraints, sets up database indexes, and applies automatic migrations (such as adding the `remark` column and updating scrap entries).
* **Commands (both point to the same script):**
  ```bash
  npm run init-db
  ```
  *or*
  ```bash
  npm run db:init
  ```
* **Executed script:** [src/lib/pg-init-db.ts](file:///d:/bajaj-1/bajaj-part-2/src/lib/pg-init-db.ts)
* **Core implementation:** `initializeDatabase()` in [src/lib/pg-db.ts](file:///d:/bajaj-1/bajaj-part-2/src/lib/pg-db.ts)

### 2. Import Bill of Materials (BOM)
Imports BOM data from an Excel/CSV file into the database for partcode/location validation.
* **Command:**
  ```bash
  npm run import-bom
  ```
* **Executed script:** [src/lib/import-bom.ts](file:///d:/bajaj-1/bajaj-part-2/src/lib/import-bom.ts)

---

## 🤖 AI & Genkit Development

These commands are used to test and debug the Google Gemini AI flows.

### 1. Start Genkit Developer UI
Starts the Firebase Genkit Developer UI, allowing you to visually inspect, run, and benchmark AI flows (e.g. handwritten form data extraction).
* **Command:**
  ```bash
  npm run genkit:dev
  ```
* **Executed command:** `genkit start -- tsx src/ai/dev.ts`

### 2. Start Genkit UI with Watch Mode
Starts the Genkit Developer UI and automatically restarts it when you make changes to the AI flow files.
* **Command:**
  ```bash
  npm run genkit:watch
  ```
* **Executed command:** `genkit start -- tsx --watch src/ai/dev.ts`

---

## 🛠️ Code Quality & Types

Utility commands to check code format, style, and Typescript safety.

### 1. Run ESLint
Lints the codebase to identify code smells and enforce formatting conventions.
* **Command:**
  ```bash
  npm run lint
  ```
* **Executed command:** `next lint`

### 2. Run TypeScript Type Check
Runs the TypeScript compiler in check-only mode (does not output compiled JS files) to verify type safety.
* **Command:**
  ```bash
  npm run typecheck
  ```
* **Executed command:** `tsc --noEmit`
