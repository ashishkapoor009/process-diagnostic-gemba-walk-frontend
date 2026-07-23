# Process Diagnostic / Gemba Walk - Frontend

Next.js frontend for the [Process Diagnostic / Gemba Walk Multi-Agent Solution](https://github.com/ashishkapoor009/process-diagnostic-gemba-walk).
Deployable on Vercel. Talks to the FastAPI backend (from that repo) over REST -
the backend must be hosted separately (Render/Railway/Docker), since the
six-agent diagnostic pipeline runs 3-8 minutes, far past Vercel's own
serverless function time limit.

## Local development

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Requires the backend running locally too:
```bash
cd ../process-excellence-agent
uvicorn app.main:api --host 0.0.0.0 --port 8000
```

## Pages

- `/` - Dashboard: recent processes, quick stats
- `/new` - Intake form (process details incl. Annual FTE Cost, steps by typing or upload) -> starts an async diagnostic job
- `/jobs/[jobId]` - Polls job status (3-8 min typical), redirects to results on completion
- `/processes/[id]` - Full results: diagnostics table, People/Process/Technology-categorized recommendations, In-Year/12-Month savings, report downloads

## Deployment

```bash
vercel --prod
```
Set `NEXT_PUBLIC_API_URL` as a Vercel project environment variable pointing
at your deployed backend's public URL.
