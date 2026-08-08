export function createCoinBurst({
  amount = 25,
  icon = "✦",
  origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  duration = 1500,
} = {}) {
  const layer = document.createElement("div");
  layer.className = "eco-coin-burst-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const colors = ["#B9FF66", "#73E6A7", "#7CE8FF", "#D6FFB0"];
  const count = Math.min(34, Math.max(12, Math.round(12 + amount / 5)));

  for (let i = 0; i < count; i++) {
    const coin = document.createElement("span");
    coin.className = "eco-coin-particle";
    coin.textContent = icon;
    coin.style.left = `${origin.x}px`;
    coin.style.top = `${origin.y}px`;
    coin.style.setProperty("--dx", `${(Math.random() - 0.5) * 520}px`);
    coin.style.setProperty("--dy", `${-120 - Math.random() * 430}px`);
    coin.style.setProperty("--r", `${(Math.random() - 0.5) * 900}deg`);
    coin.style.setProperty("--delay", `${Math.random() * 180}ms`);
    coin.style.setProperty("--c", colors[i % colors.length]);
    layer.appendChild(coin);
  }

  const label = document.createElement("div");
  label.className = "eco-coin-reward";
  label.innerHTML = `<strong>+${amount} Eco-Coin</strong><span>Tabiatga yana bir yaxshi qadam</span>`;
  label.style.left = `${Math.min(window.innerWidth - 280, Math.max(20, origin.x - 130))}px`;
  label.style.top = `${Math.max(32, origin.y - 86)}px`;
  layer.appendChild(label);

  window.setTimeout(() => layer.remove(), duration + 400);
}

export function showToast(title, message, type = "success") {
  const root = document.querySelector("#eco-toast-root") || (() => {
    const el = document.createElement("div");
    el.id = "eco-toast-root";
    el.className = "eco-toast-root";
    document.body.appendChild(el);
    return el;
  })();

  const toast = document.createElement("div");
  toast.className = `eco-toast eco-toast-${type}`;
  toast.innerHTML = `<span class="eco-toast-icon">${type === "success" ? "✓" : "!"}</span>
    <span><strong>${title}</strong><small>${message}</small></span>`;
  root.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 280);
  }, 3400);
}
