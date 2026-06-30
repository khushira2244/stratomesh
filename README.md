# StratoMesh

**StratoMesh is a stratosphere-level workflow mesh for insurance operations.**

It connects client companies, broker companies, and insurance company teams into one case journey where requests, documents, comments, observations, blockers, handoffs, and decisions stay together.

## What StratoMesh does

StratoMesh is a multi-layer insurance workflow platform with separate but connected workspaces for:

* Client company layer
* Broker company layer
* Insurance company layer
* Manager / operations layer

For the current working demo, we focused on the insurance company side and built the end-to-end team mapping across the policy and claim journey. The client company and broker company layers are part of the platform design and are planned as expanded feature layers after the current insurance workflow foundation.

The insurance company workspace includes role-based flows for:

* Sales
* Underwriting
* Pricing
* Finance
* Claims
* Policy Issuance
* Manager

Each team can work with case boxes, comments, observations, documents, routing, and communication flow.

## Demo journeys

The current demo supports two journeys:

### 1. Happy New Policy Journey

Client: **Sunrise Foods Pvt Ltd**
Case type: **Fire & Property Insurance — New Policy Quotation**

Flow:

```txt
Broker request
→ Sales intake
→ Underwriting review
→ Pricing
→ Finance
→ Policy Issuance
→ Manager visibility
```

### 2. Claim Settlement Journey

Client: **Delta Logistics Pvt Ltd**
Case type: **Fire & Property Insurance — Claim Settlement**

Flow:

```txt
Claim intimation
→ Claims intake
→ Survey / document review
→ Finance clearance
→ Manager observation
→ Settlement tracking
```

## Tech stack

* **Next.js** — frontend and backend API routes
* **Vercel** — deployment
* **AWS Aurora PostgreSQL** — workflow memory database
* **Prisma ORM** — database access and schema management
* **AI-assisted extraction** — converts broker/client documents into structured case data

## AWS Aurora PostgreSQL

AWS Aurora PostgreSQL is used as the core workflow memory database.

It stores:

* Organizations
* Teams
* Insurance cases
* Case documents
* Workflow blocks
* Comments
* Observations
* Handoffs
* Decision history
* AI suggestions

## Important note about Aurora cold start

This project uses AWS Aurora Serverless. If the database has been idle or scaled down, the first API request may fail or take longer because Aurora needs time to wake up.

If an API fails the first time with a database connection error, wait a few seconds and refresh or call the API again.

For demo or recording, keep the database warm by opening one backend API before starting the walkthrough.

Example warm-up API:

```txt
GET /api/insurance-company/cases
```

## Main APIs

### Demo scenario resolver

These APIs return the current active demo case from AWS Aurora.

```txt
GET /api/insurance-company/demo-scenarios/happy-new-policy
GET /api/insurance-company/demo-scenarios/claim-settlement
```

The frontend should use these APIs instead of hardcoded case IDs.

### Case APIs

```txt
GET /api/insurance-company/cases
GET /api/insurance-company/cases/{caseId}
POST /api/insurance-company/cases/from-upload
POST /api/insurance-company/cases/from-extraction
PATCH /api/insurance-company/cases/{caseId}/progress
```

### Sales intake APIs

```txt
GET /api/insurance-company/intake/sales/emails
GET /api/insurance-company/intake/sales/emails/{emailId}
POST /api/insurance-company/intake/sales/emails/{emailId}/create-case
```

### Team queue APIs

```txt
GET /api/insurance-company/teams/sales/cases
GET /api/insurance-company/teams/underwriting/cases
GET /api/insurance-company/teams/pricing/cases
GET /api/insurance-company/teams/finance/cases
GET /api/insurance-company/teams/claims/cases
```

### Manager APIs

```txt
GET /api/insurance-company/manager/observations
GET /api/insurance-company/external/broker-requests?managerObservationRequired=true
```

## Local setup

Install dependencies:

```bash
npm install
```

Set environment variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@AWS_AURORA_ENDPOINT:5432/DB_NAME?schema=public&sslmode=require"
OPENAI_API_KEY="your_openai_api_key"
```

Push Prisma schema:

```bash
npx prisma db push
npx prisma generate
```

Run locally:

```bash
npm run dev
```

Backend runs on:

```txt
http://localhost:3001
```

## Demo data creation

Create fresh Sunrise happy case:

```powershell
$happyBody = @{
  attachmentId = "att_sunrise_001"
  agendaId = "new-policy-premium-closure"
  sessionId = "demo-happy"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3001/api/insurance-company/intake/sales/emails/email_sunrise_happy_001/create-case" `
  -ContentType "application/json" `
  -Body $happyBody
```

Create fresh claim case from markdown upload:

```powershell
$claimFile = "C:\Users\Khushboo\Documents\StratoMesh\docs\broker-docs\03_claim_delta_logistics.md"

$claimResponse = curl.exe -X POST `
  -F "file=@$claimFile;type=text/markdown" `
  "http://localhost:3001/api/insurance-company/cases/from-upload"

$claimResponse | ConvertFrom-Json | ConvertTo-Json -Depth 40
```

Then verify:

```txt
GET /api/insurance-company/demo-scenarios/happy-new-policy
GET /api/insurance-company/demo-scenarios/claim-settlement
```

## Frontend scenario rule

The frontend should not hardcode demo case IDs.

Correct flow:

```txt
User clicks demo story card
→ Frontend calls demo scenario API
→ Backend returns activeCaseId
→ Frontend saves activeCaseId in localStorage
→ Every team page loads the same case
```

## Architecture

Current architecture:

```txt
Users
→ Vercel Frontend
→ Next.js API Routes
→ AI-assisted extraction and workflow logic
→ Prisma ORM
→ AWS Aurora PostgreSQL
```

Future architecture expands into:

```txt
AI automation
Document storage
Queue workers
Search
Cache
External integrations
Observability
Access control
```

## Additional links

### Visual product story

This page explains the product thinking behind StratoMesh — how scattered insurance work across emails, spreadsheets, dashboards, chats, documents, and repeated follow-ups becomes one connected case journey.

```txt
https://whystratoisdifferent.vercel.app/
```

### Build timeline

This page shows the build journey and how StratoMesh evolved from the initial insurance workflow idea into a working Vercel + AWS Aurora powered platform.

```txt
https://vercel.com/khushira2244s-projects/stratomesh_timeline
```

## AWS Aurora API story

StratoMesh uses AWS Aurora PostgreSQL as the source of truth for demo cases and workflow memory.

The frontend does not depend on hardcoded case IDs. Instead, it calls backend scenario APIs, and the backend returns the latest active case from AWS Aurora.

```txt
GET /api/insurance-company/demo-scenarios/happy-new-policy
GET /api/insurance-company/demo-scenarios/claim-settlement
```

These APIs return the active policy or claim case, including:

```txt
activeCaseId
caseCode
clientCompanyName
insuranceType
currentTeam
currentBlockName
currentStatus
```

This lets the demo stay stable even when fresh cases are created during testing or recording.
