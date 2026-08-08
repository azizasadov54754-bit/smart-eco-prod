# Smart Eco — Next Stage

Bu paket Smart Eco MVP'ni production yo'nalishiga olib chiqish uchun frontend UX layer, micro-interactions va reward engine qo'shimchalari bilan tayyorlangan.

## Qo'shilgan
- Premium eco glassmorphism / dark-green visual system
- Reduced-motion accessibility
- Coin burst reward animation
- Reward toast
- Streak progression
- Live Eco-Coin balance interaction
- Mobile-safe notification/toast layer
- Real browser QR camera API bilan integratsiya qilishga tayyor feature layer

## Keyingi production arxitekturasi

Web/Mobile:
- React + Vite / PWA
- Capacitor orqali Android APK/AAB
- QR Scanner: BarcodeDetector API + fallback library
- Geolocation API
- Push notifications

Backend:
- FastAPI
- PostgreSQL
- Redis
- JWT/refresh token
- WebSocket
- Celery/BullMQ equivalent job worker

IoT:
- MQTT
- ThingsBoard
- Smart bin telemetry
- Device heartbeat
- fill level / battery / temperature

Domain modules:
- auth
- organizations
- campuses
- buildings
- bins
- devices
- telemetry
- alerts
- collections
- routes
- maintenance
- qr-scans
- eco-coins
- leaderboard
- rewards
- recyclers
- reports
- billing

## Local
Frontend:
npm install
npm run dev

Backend:
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

## APK
Productionda:
npm run build
npx cap sync android
npx cap open android

Android Studio orqali signed AAB/APK build qilinadi.
