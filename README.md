# myownbillbook — SuperAdmin & Platform Console

Dedicated Next.js 16 standalone management panel for platform administrators, tenant observability, and enterprise controls.

## Features
- **System Statistics & Metrics**: Active organizations, companies, branches, warehouses, global users, and business transaction volume.
- **Tenant Management**: Multi-tenant isolation control, company status toggling, subscription tiers, and audit-safe impersonation.
- **Global User Directory**: Cross-tenant user search, role escalation, and credential controls.
- **Platform Analytics**: Global sales & invoice velocity, tax distributions, and diagnostic event streams.
- **Support & Security Sessions**: Real-time support session management and system health watchdog.

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Setup
Configure `.env.local` to point to the backend API:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
API_INTERNAL_URL=http://localhost:4000/api/v1
PORT=3001
```

### 3. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Production Build
```bash
pnpm build
pnpm start
```
