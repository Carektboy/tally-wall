const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

const dpr = window.devicePixelRatio || 1;

/* ================= PEOPLE ================= */
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

/* ================= CONFIG ================= */
const DAY_GAP = 22;        // horizontal spacing between days
const ROW_GAP = 90;        // vertical spacing between rows
const TALLY_HEIGHT = 42;
const TALLY_SPREAD = 6;    // horizontal spread between people
const WIGGLE = 3;          // subtle hand-drawn feel
/* ========================================= */

let scale = 0.8;
let offsetX = 120;
let offsetY = 120;

let tallies = [];
let startDate;

/* ---------- INIT ---------- */
function init() {
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";

  startDate = new Date(
    Math.min(...people.map(p => new Date(p.born)))
  );

  buildTallies();
  draw();
}

/* ---------- BUILD ---------- */
function buildTallies() {
  tallies = [];

  const today = new Date();
  const totalDays = Math.floor((today - startDate) / 86400000);

  let x = 0;
  let y = 0;
  const maxPerRow = Math.floor(innerWidth / DAY_GAP) - 4;

  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(startDate.getTime() + i * 86400000);

    const alive = people.filter(p =>
      new Date(p.born) <= date &&
      (!p.died || new Date(p.died) >= date)
    );

    tallies.push({
      x: x * DAY_GAP,
      y: y * ROW_GAP,
      date,
      alive
    });

    x++;
    if (x > maxPerRow) {
      x = 0;
      y++;
    }
  }
}

/* ---------- DRAW ---------- */
function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#fdfaf6";
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  tallies.forEach(t => {
    t.alive.forEach((p, i) => {
      drawTally(
        t.x + i * TALLY_SPREAD,
        t.y,
        p.color,
        i
      );
    });
  });

  ctx.restore();
}

/* ---------- WIGGLY TALLY ---------- */
function drawTally(x, y, color, seed) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  ctx.beginPath();

  const wiggleX = () => (Math.random() - 0.5) * WIGGLE;
  const wiggleY = () => (Math.random() - 0.5) * WIGGLE;

  ctx.moveTo(x + wiggleX(), y + wiggleY());
  ctx.lineTo(
    x + wiggleX(),
    y - TALLY_HEIGHT + wiggleY()
  );

  ctx.stroke();
}

/* ---------- ZOOM (CURSOR-CENTERED, FIXED) ---------- */
window.addEventListener("wheel", e => {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left - offsetX) / scale;
  const my = (e.clientY - rect.top - offsetY) / scale;

  if (e.ctrlKey || e.metaKey) {
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(scale * zoom, 0.25), 4);

    offsetX = e.clientX - rect.left - mx * newScale;
    offsetY = e.clientY - rect.top - my * newScale;
    scale = newScale;
  } else {
    offsetX -= e.deltaX;
    offsetY -= e.deltaY;
  }

  requestAnimationFrame(draw);
}, { passive: false });

/* ---------- TOOLTIP ---------- */
window.addEventListener("mousemove", e => {
  const mx = (e.clientX - offsetX) / scale;
  const my = (e.clientY - offsetY) / scale;

  const t = tallies.find(t =>
    mx > t.x - 6 &&
    mx < t.x + 20 &&
    my < t.y &&
    my > t.y - TALLY_HEIGHT
  );

  if (!t) {
    tooltip.style.opacity = 0;
    return;
  }

  tooltip.style.opacity = 1;
  tooltip.style.left = e.clientX + 14 + "px";
  tooltip.style.top = e.clientY + 14 + "px";
  tooltip.innerHTML = `<strong>${t.date.toDateString()}</strong>`;
});

window.addEventListener("resize", init);
init();
