# Eco Reward Integration

Istalgan React komponentida:

```js
import { createCoinBurst, showToast } from "./lib/ecoEffects";

function onSuccessfulScan(amount) {
  createCoinBurst({
    amount,
    origin: { x: window.innerWidth / 2, y: window.innerHeight * 0.45 }
  });
  showToast("Tabriklaymiz!", `+${amount} Eco-Coin hisobingizga qo‘shildi.`);
}
```

Bu effektni real backend `POST /api/scans` muvaffaqiyatli javob qaytargandan keyin chaqiring.

## UX qoidasi
Coin beriladigan holatlarda:
1. QR validatsiya
2. Backend transaction
3. Balance update
4. Coin burst
5. Impact/streak update
6. Reward suggestion
7. Toast/push notification

Animatsiya faqat 2–3 soniya davom etadi va `prefers-reduced-motion`ni hurmat qiladi.
