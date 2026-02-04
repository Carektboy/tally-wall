const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");
const scrollContainer = document.getElementById("scroll-container");

let scale = 1;
let offsetY = 0;
let tallies = [];
let contentHeight = 0;

/* ===== CONFIG ===== */
const GAP_X = 46;
const GAP_Y = 60;
const PER_ROW = 30;

const LINE_WIDTH = 4;
const LINE_HEIGHT = 40;
const LINE_GAP = 6;
/* ================== */

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}
window.addEventListener("resize", resizeCanvas);

// ---------- LOAD ----------
fetch("./data.json")
  .then(r => r.json())
  .then(data => buildTallies(data.people));

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

    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;

    tallies.push({
      x: 60 + col * GAP_X,
      y: 60 + row * GAP_Y,
      people: active,
      label: `${active.map(p => p.name).join(", ")} — ${date.toDateString()}`
    });
  }

  contentHeight = tallies[tallies.length - 1].y + 200;
  scrollContainer.scrollTop = 0;
  resizeCanvas();
}

// ---------- DRAW (CULLED) ----------
function draw() {
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.setTransform(scale,0,0,scale,0,offsetY);

  const viewTop = -offsetY / scale - 100;
  const viewBottom = viewTop + canvas.height / scale + 200;

  for (const t of tallies) {
    if (t.y < viewTop || t.y > viewBottom) continue;

    t.people.forEach((p, i) => {
      ctx.strokeStyle = p.colors[0];
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = "round";

      const x = t.x + i * LINE_GAP;
      ctx.beginPath();
      ctx.moveTo(x, t.y);
      ctx.lineTo(x, t.y - LINE_HEIGHT);
      ctx.stroke();
    });
  }
}

// ---------- SCROLL (THROTTLED) ----------
let ticking = false;
scrollContainer.addEventListener("scroll", () => {
  offsetY = -scrollContainer.scrollTop;
  if (!ticking) {
    requestAnimationFrame(() => {
      draw();
      ticking = false;
    });
    ticking = true;
  }
});

// ---------- ZOOM ----------
canvas.addEventListener("wheel", e => {
  if (!e.ctrlKey) return;
  e.preventDefault();

  scale *= e.deltaY < 0 ? 1.1 : 0.9;
  scale = Math.min(Math.max(scale, 0.5), 6);
  draw();
}, { passive: false });

// ---------- TOOLTIP ----------
canvas.addEventListener("mousemove", e => {
  const mx = e.clientX / scale;
  const my = (e.clientY - offsetY) / scale;

  const hit = tallies.find(t =>
    Math.abs(mx - t.x) < 30 &&
    my < t.y &&
    my > t.y - LINE_HEIGHT
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
