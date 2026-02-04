const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
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

/* =============== CONFIG ================= */
const ROW_GAP = 90;
const TIME_SCALE = 0.06; // pixels per day
const WIGGLE_AMPLITUDE = 8;
const WIGGLE_STEP = 14;
/* ======================================= */

let scale = 0.9;
let offsetX = 120;
let offsetY = 120;

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

  draw();
}

/* ---------- UTILS ---------- */
function daysBetween(a, b) {
  return Math.floor((b - a) / 86400000);
}

/* ---------- DRAW ---------- */
function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#f6f2ec";
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  people.forEach((p, row) => {
    drawLifeLine(p, row);
  });

  ctx.restore();
}

/* ---------- LIFE LINE ---------- */
function drawLifeLine(person, row) {
  const born = new Date(person.born);
  const end = person.died ? new Date(person.died) : new Date();

  const yBase = row * ROW_GAP;
  const startX = daysBetween(startDate, born) * TIME_SCALE;
  const endX = daysBetween(startDate, end) * TIME_SCALE;

  ctx.strokeStyle = person.color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  ctx.beginPath();

  let x = startX;
  let y = yBase;

  ctx.moveTo(x, y);

  for (; x <= endX; x += WIGGLE_STEP) {
    const wiggle =
      Math.sin(x * 0.05 + row) * WIGGLE_AMPLITUDE +
      Math.cos(x * 0.03 + row * 3) * 2;

    ctx.lineTo(x, yBase + wiggle);
  }

  ctx.stroke();

  /* Name label */
  ctx.fillStyle = "#222";
  ctx.font = "13px system-ui";
  ctx.fillText(person.name, startX - 10, yBase - 10);
}

/* ---------- ZOOM (FIXED – CURSOR ANCHORED) ---------- */
window.addEventListener("wheel", e => {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left - offsetX) / scale;
  const cy = (e.clientY - rect.top - offsetY) / scale;

  if (e.ctrlKey || e.metaKey) {
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.2), 4);

    offsetX = e.clientX - rect.left - cx * newScale;
    offsetY = e.clientY - rect.top - cy * newScale;
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

  const row = Math.round(my / ROW_GAP);
  const person = people[row];

  if (!person) {
    tooltip.style.opacity = 0;
    return;
  }

  tooltip.style.opacity = 1;
  tooltip.style.left = e.clientX + 12 + "px";
  tooltip.style.top = e.clientY + 12 + "px";

  tooltip.innerHTML = `
    <strong>${person.name}</strong><br>
    Born: ${person.born}<br>
    ${person.died ? "Died: " + person.died : "Alive"}
  `;
});

window.addEventListener("resize", init);
init();
