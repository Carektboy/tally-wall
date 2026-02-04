const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

let scale = 1;
let offsetX = 0;
let offsetY = 0;

let tallies = [];
let contentWidth = 0;
let contentHeight = 0;

// ====== CONFIG ======
const GAP_X = 40;   // horizontal gap between days
const GAP_Y = 90;   // vertical gap between rows
const PER_ROW = 30; // days per row
const STROKE_HEIGHT = 40;
// ====================

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ---------- LOAD DATA ----------
fetch("data.json")
  .then(r => r.json())
  .then(data => buildTallies(data.people));

// ---------- BUILD TALLIES ----------
function buildTallies(people) {
  const startDate = new Date(people[0].dob);
  const today = new Date();
  const msDay = 86400000;

  const totalDays = Math.floor((today - startDate) / msDay);

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate.getTime() + i * msDay);

    let active = people.filter(p => new Date(p.dob) <= date);
    let colors = active[active.length - 1].colors;

    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;

    tallies.push({
      x: 100 + col * GAP_X,
      y: 100 + row * GAP_Y,
      colors,
      label: `${active.map(p => p.name).join(", ")} — ${date.toDateString()}`
    });
  }

  const last = tallies[tallies.length - 1];
  contentWidth = last.x + 300;
  contentHeight = last.y + 300;

  draw();
}

// ---------- DRAW ----------
function draw() {
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#f4efe8";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.setTransform(scale,0,0,scale,offsetX,offsetY);

  tallies.forEach(t => {
    t.colors.forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(t.x + i * 10, t.y);
      ctx.lineTo(t.x + i * 10, t.y - STROKE_HEIGHT);
      ctx.stroke();
    });
  });
}

// ---------- CAMERA CLAMP ----------
function clampCamera() {
  const minX = canvas.width - contentWidth * scale;
  const minY = canvas.height - contentHeight * scale;

  offsetX = Math.min(0, Math.max(offsetX, minX));
  offsetY = Math.min(0, Math.max(offsetY, minY));
}

// ---------- ZOOM ----------
canvas.addEventListener("wheel", e => {
  e.preventDefault();

  if (!e.ctrlKey) {
    offsetY -= e.deltaY;
    clampCamera();
    draw();
    return;
  }

  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const mx = e.clientX;
  const my = e.clientY;

  const wx = (mx - offsetX) / scale;
  const wy = (my - offsetY) / scale;

  scale *= zoomFactor;
  scale = Math.min(Math.max(scale, 0.3), 12);

  offsetX = mx - wx * scale;
  offsetY = my - wy * scale;

  clampCamera();
  draw();
}, { passive: false });

// ---------- TOOLTIP ----------
canvas.addEventListener("mousemove", e => {
  const mx = (e.clientX - offsetX) / scale;
  const my = (e.clientY - offsetY) / scale;

  const hit = tallies.find(t =>
    Math.abs(mx - t.x) < 15 &&
    Math.abs(my - t.y) < STROKE_HEIGHT
  );

  if (hit) {
    tooltip.textContent = hit.label;
    tooltip.style.left = e.clientX + 15 + "px";
    tooltip.style.top = e.clientY + 15 + "px";
    tooltip.style.opacity = 1;
  } else {
    tooltip.style.opacity = 0;
  }
});
