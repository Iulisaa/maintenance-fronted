# Maintenance App Frontend

Lean React + TypeScript + Vite frontend for the maintenance workflow.

## Included pages

- `My Tasks` — engineer worklist with pending maintenance reports and report completion flow
- `Equipments` — equipment creation, recurrence setup, and engineer assignment

## Expected backend endpoints

- `GET /api/engineers`
- `GET /api/equipments`
- `POST /api/equipments`
- `GET /api/tasks/engineers/{engineerId}/pending?date=YYYY-MM-DD`
- `GET /api/tasks/{taskId}`
- `POST /api/reports/tasks/{taskId}/complete`

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Update `.env` if the backend runs on a different base URL.

## Build

```bash
npm run build
```
