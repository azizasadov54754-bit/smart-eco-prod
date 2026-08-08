# Smart Eco Production v3

## Arxitektura
- React/Vite frontend
- FastAPI API
- PostgreSQL persistent database
- Redis realtime/cache/event bus
- WebSocket endpoint `/ws`
- JWT authentication
- QR replay protection + transaction ledger
- Smart Bin telemetry model ready for MQTT/ThingsBoard adapter
- Railway deployment config
- Docker Compose local stack

## Local — eng oson usul
1. Docker Desktop o‘rnating.
2. `docker compose up --build`
3. API: http://localhost:8000
4. Swagger: http://localhost:8000/docs
5. Frontend: `npm install && npm run dev`
6. Frontend: http://localhost:5173

## Railway — hammaga ochiq URL
1. GitHub'ga shu papkani yangi repo qilib push qiling.
2. Railway → New Project → Deploy from GitHub Repo.
3. Repo'ni tanlang.
4. PostgreSQL service qo‘shing: Railway Project → + New → Database → PostgreSQL.
5. Redis service qo‘shing: + New → Database → Redis.
6. API service uchun Root Directory `backend` qiling yoki monorepo build configdan `backend/Dockerfile`ni ishlating.
7. API Variables:
   DATABASE_URL = `${{Postgres.DATABASE_URL}}` (agar SQLAlchemy async bo‘lsa `postgresql+asyncpg://` formatiga moslang)
   REDIS_URL = `${{Redis.REDIS_URL}}`
   JWT_SECRET = uzun random secret
   CORS_ORIGINS = frontend URL
8. Networking → Generate Domain.
9. Healthcheck `/api/health`.
10. Frontend'ni alohida Railway service sifatida deploy qiling va `VITE_API_URL`ni API URLga bering.

Railway PostgreSQL va Redis uchun reference variables beradi. GitHub branchga push qilinganda linked service avtomatik deploy qilinishi mumkin.

## Muhim
- `.env`ni GitHub'ga yuklamang.
- JWT_SECRET va admin credentiallarni o‘zgartiring.
- Productionda HTTPS ishlating; kamera API uchun secure context kerak.
- QR rewardni faqat backend tasdiqlagandan keyin frontend animatsiyasini ishga tushiring.
- Real IoT uchun MQTT broker + ThingsBoard connectorni alohida service sifatida ulang.

## Railway uchun tavsiya etilgan service layout

Project:
- `smart-eco-web` — frontend, public domain
- `smart-eco-api` — FastAPI, public API domain
- `Postgres` — private DB
- `Redis` — private cache/event bus

Frontend variable:
`VITE_API_URL=https://YOUR-API-DOMAIN`

API variable:
`CORS_ORIGINS=https://YOUR-WEB-DOMAIN`

### Nega Railway?
MVP uchun bitta Project ichida API + PostgreSQL + Redis qilish juda qulay. PostgreSQL va Redis xizmatlari Railway'da tayyor template sifatida qo'shiladi; service'lar reference variables orqali ulanadi.
