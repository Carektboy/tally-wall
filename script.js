const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const tooltip = document.getElementById("tooltip");

const dpr = window.devicePixelRatio || 1;

/* ================== PEOPLE ================== */
const people = [
  { name: "Grandfather", born: "1943-01-01", died: "1985-01-01", color: "#444" },
  { name: "Grandmother", born: "1942-02-01", died: null, color: "#2d5a27" },
  { name: "Father", born: "1969-06-08", died: null, color: "#1e3a8a" },
  { name: "Uncle", born: "1971-01-01", died: null, color: "#7c2d12" },
  { name: "Fupu", born: "1974-01-01", died: null, color: "#6b21a8" },
  { name: "Mother", born: "1980-01-29", died: null, color: "#9a3412" },
  { name: "Aunt", born: "1985-01-01", died: null, color: "#5b21b6" },
  { name: "Me", born: "2004-08-07", died: null, color: "#0369a1" },
  { name: "Cousin 1", born: "2005-04-05", died: null, color: "#854d0e" },
  { name: "Brother", born: "2008-05-07", died: null, color: "#9d174d" },
  { name: "Cousin 2", born: "2009-01-09", died: null, color: "#065f46" }
];

/* =============== CONFIG ================= */
const TALLY_WIDTH = 14;
const TALLY_HEIGHT = 120;
const GAP_X = 38;
const GAP_Y = 150;
const STRIPE_WIDTH = 3;
/* ======================================= */

let scale = 0.7;
let offsetX = 80;
let offsetY = 80;
let tallies = [];
const patternCache = new Map();

/* ---------- STRIPE PATTERN ---------- */
function makeStripePattern(color, index) {
  const key = color + index;
  if (patternCache.has(key)) return patternCache.get(key);

  const p = document.createElement("canvas");
  p.width = STRIPE_WIDTH * 4;
  p.height = TALLY_HEIGHT;
  const pctx = p.getContext("2d");

  for (let i = 0; i < 4; i++) {
    pctx.fillStyle = i === index % 4 ? color : "#e5e1db";
    pctx.fillRect(i * STRIPE_WIDTH, 0, STRIPE_WIDTH, TALLY_HEIGHT);
  }

  const pattern = ctx.createPattern(p, "repeat");
  patternCache.set(key, pattern);
  return pattern;
}

/* ---------- INIT ---------- */
function init() {
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";

  buildTallies();
  draw();
}

/* ---------- BUILD TALLIES ---------- */
function buildTallies() {
  tallies = [];
  const sorted = [...people].sort((a,b)=>new Date(a.born)-new Date(b.born));
  const start = new Date(sorted[0].born);
  const today = new Date();

  let x = 0, y = 0;
  const wrap = innerWidth - 200;

  for (let d = new Date(start); d <= today; d.setDate(d.getDate()+1)) {
    const alive = sorted.filter(p => {
      const born = new Date(p.born);
      const died = p.died ? new Date(p.died) : null;
      return born <= d && (!died || d <= died);
    });

    if (x > wrap) {
      x = 0;
      y += GAP_Y;
    }

    tallies.push({
      x, y,
      date: d.toDateString(),
      people: alive
    });

    x += GAP_X;
  }
}

/* ---------- DRAW ---------- */
function draw() {
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle = "#f6f2ec";
  ctx.fillRect(0,0,innerWidth,innerHeight);

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  tallies.forEach(t => {
    t.people.forEach((p, i) => {
      ctx.fillStyle = makeStripePattern(p.color, i);
      ctx.fillRect(t.x + i*4, t.y, TALLY_WIDTH, TALLY_HEIGHT);
    });
  });

  ctx.restore();
}

/* ---------- INTERACTION ---------- */
window.addEventListener("wheel", e => {
  e.preventDefault();
  if (e.ctrlKey) {
    const zoom = Math.sign(e.deltaY) * -0.1;
    scale = Math.min(Math.max(scale + zoom, 0.1), 3);
  } else {
    offsetX -= e.deltaX;
    offsetY -= e.deltaY;
  }
  requestAnimationFrame(draw);
},{passive:false});

window.addEventListener("mousemove", e => {
  const mx = (e.clientX - offsetX) / scale;
  const my = (e.clientY - offsetY) / scale;

  const hit = tallies.find(t =>
    mx > t.x && mx < t.x + 40 &&
    my > t.y && my < t.y + TALLY_HEIGHT
  );

  if (hit) {
    tooltip.style.opacity = 1;
    tooltip.style.left = e.clientX + 14 + "px";
    tooltip.style.top = e.clientY + 14 + "px";
    tooltip.innerHTML = `<strong>${hit.date}</strong><br>${hit.people.map(p=>p.name).join(", ")}`;
  } else tooltip.style.opacity = 0;
});

window.addEventListener("resize", init);
init();
