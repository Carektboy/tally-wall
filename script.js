console.log("script loaded");

const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");
const scrollContainer = document.getElementById("scroll-container");

let scale = 1;
let offsetX = 0;
let offsetY = 0;

let tallies = [];
let contentHeight = 0;

/* ================= CONFIG ================= */
const GAP_X = 46;
const GAP_Y = 60;
const PER_ROW = 30;

const TALLY_WIDTH = 14;
const TALLY_HEIGHT = 40;
/* ========================================== */

// ---------- RESIZE ----------
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight; // ✅ FIX
  draw();
}

window.addEventListener("resize", resizeCanvas);

// ---------- STRIPE CACHE ----------
const patternCache = new Map();

function getStripePattern(colors) {
  const key = colors.join(",");
  if (patternCache.has(key)) return patternCache.get(key);

  const pCanvas = document.createElement("canvas");
  const pCtx = pCanvas.getContext("2d");

  const stripeWidth = 4;
  pCanvas.width = stripeWidth * colors.length;
  pCanvas.height = TALLY_HEIGHT;

  colors.forEach((c, i) => {
    pCtx.fillStyle = c;
    pCtx.fillRect(i * stripeWidth, 0, stripeWidth, TALLY_HEIGHT);
  });

  const pattern = ctx.createPattern(pCanvas, "repeat");
  patternCache.set(key, pattern);
  return pattern;
}

// ---------- LOAD DATA ----------
fetch("./data.json")
  .then(r => r.json())
  .then(data => buildTallies(data.people))
  .catch(err => console.error("JSON load failed", err));

// ---------- BUILD ----------
function buildTallies(people) {
  tallies = [];

  const startDate = new Date(people[0].dob);
  const today = new Date();
  const msDay = 86400000;
  const totalDays = Math.floor((today - startDate) / msDay);

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate.getTime() + i * msDay);
    const active = people.filter(p => new Date(p.dob) <= date);
    const colors = active[active.length - 1].colors;

    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;

    tallies.push({
      x: 60 + col * GAP_X,
      y: 60 + row * GAP_Y,
      colors,
      label: `${active.map(p => p.name).join(", ")} — ${date.toDateString()}`
    });
  }

  const last = tallies[tallies.length - 1];
  contentHeight = last.y + 200;

  // ✅ THIS is how scrollbar height is set
  scrollContainer.scrollTop = 0;
  scrollContainer.style.height = window.innerHeight + "px";
  scrollContainer.scrollHeight = contentHeight;

  resizeCanvas();
}

// ---------- DRAW ----------
function draw() {
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.setTransform(scale,0,0,scale,offsetX,offsetY);

  tallies.forEach(t => {
    ctx.fillStyle = getStripePattern(t.colors);
    ctx.fillRect(t.x, t.y - TALLY_HEIGHT, TALLY_WIDTH, TALLY_HEIGHT);

    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.strokeRect(t.x, t.y - TALLY_HEIGHT, TALLY_WIDTH, TALLY_HEIGHT);
  });
}

// ---------- SCROLL ----------
scrollContainer.addEventListener("scroll", () => {
  offsetY = -scrollContainer.scrollTop;
  draw();
});

// ---------- ZOOM ----------
canvas.addEventListener("wheel", e => {
  if (!e.ctrlKey) return;
  e.preventDefault();

  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  scale = Math.min(Math.max(scale * zoom, 0.4), 6);
  draw();
}, { passive: false });

// ---------- TOOLTIP ----------
canvas.addEventListener("mousemove", e => {
  const mx = (e.clientX - offsetX) / scale;
  const my = (e.clientY - offsetY) / scale;

  const hit = tallies.find(t =>
    mx > t.x &&
    mx < t.x + TALLY_WIDTH &&
    my < t.y &&
    my > t.y - TALLY_HEIGHT
  );

  if (hit) {
    tooltip.textContent = hit.label;
    tooltip.style.left = e.clientX + 12 + "px";
    tooltip.style.top = e.clientY + 12 + "px";
    tooltip.style.opacity = 1;
  } else {
    tooltip.style.opacity = 0;
  }
});
