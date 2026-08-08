# Smart Eco Platform v2

Premium, responsive Smart Campus ekotizimi uchun frontend + minimal real backend scaffold.

## 1. Frontend

```bash
cd smart-eco
npm install
npm run dev
```

Brauzer:
`http://localhost:5173`

Production:
```bash
npm run build
npm run preview
```

### Telefon / QR

Telefon kamerasi uchun:
- `localhost` ishlaydi;
- yoki HTTPS domen kerak.

Chrome/Safari kamera permission so‘raydi. QR avtomatik aniqlash uchun browser `BarcodeDetector`ni qo‘llasa, QR real vaqtda o‘qiladi. Aks holda qo‘lda `BIN-001` kabi ID kiritish mumkin.

## 2. Backend

Python 3.10+:

```bash
cd backend
python -m venv .venv
```

Windows:
```powershell
.venv\Scripts\activate
```

macOS/Linux:
```bash
source .venv/bin/activate
```

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API:
`http://127.0.0.1:8000/docs`

Frontendni backendga ulash:
```bash
# frontend root .env
VITE_API_URL=http://127.0.0.1:8000
```

## 3. Production arxitektura

Frontend:
- Vercel / Netlify / Cloudflare Pages

Backend:
- Railway / Render / Fly.io / VPS

Database:
- MVP: SQLite
- Production: PostgreSQL

IoT:
- ThingsBoard yoki MQTT broker

Keyingi API modullar:
`auth`, `organizations`, `campuses`, `buildings`, `bins`, `devices`, `telemetry`,
`alerts`, `collections`, `routes`, `maintenance`, `qr-scans`, `eco-coins`,
`leaderboard`, `rewards`, `recyclers`, `reports`, `billing`.

## 4. V2 da ishlaydigan qismlar

- Demo telefon orqali onboarding
- Ism + familiya + telefon
- Profilni tahrirlash
- UZ / EN / RU
- Dark / Light
- Responsive desktop + mobile
- Premium navigation
- Smart Bin map/search/filter
- Browser geolocation
- Google Maps route
- Real camera QR scanner
- QR fallback input
- Eco-Coin
- Reward marketplace
- Coupon wallet
- Leaderboard
- Events
- Notifications panel
- PWA
- Local persistence
- Backend health/user/bin/scan/leaderboard/reward API scaffold
- Accessibility uchun reduced-motion
- Mobile bottom navigation + desktop sidebar

## 5. Muhim production eslatma

Frontend hozir backend mavjud bo‘lmasa ham demo sifatida ishlaydi. Real IoT sensorlar, authentication SMS OTP,
PostgreSQL, ThingsBoard/MQTT, anti-fraud QR validation va billing keyingi integratsiya bosqichidir.
