const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

/* ---------- CANVAS SIZE ---------- */
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ---------- IMPORTANT DATES ---------- */
const grandmomBirth = new Date("1966-05-12");
const fatherBirth = new Date("1984-05-12"); // example
const myBirth = new Date("2004-05-12");     // example
const today = new Date();

/* ---------- LAYOUT SETTINGS ---------- */
const itemsPerRow = 60;
const xSpacing = 16;
const ySpacing = 50;
const startX = 0;
const startY = 0;

/* ---------- CAMERA ---------- */
let scale = 1;
let offsetX = 100;
let offsetY = 100;

/* ---------- PAN STATE ---------- */
let isDragging = false;
let dragX = 0;
let dragY = 0;

/* ---------- DATA ---------- */
const tallies = [];

/* ---------- GENERATE DAY-BY-DAY TALLIES ---------- */
const msDay = 24 * 60 * 60 * 1000;
const totalDays = Math.floor((today - grandmomBirth) / msDay);

for (let i = 0; i <= totalDays; i++) {
  const date = new Date(grandmomBirth.getTime() + i * msDay);

  let era = "Grandmom";
  let strokes = 1;

  if (date >= fatherBirth && date < myBirth) {
    era = "Father";
    strokes = 2;
  } else if (date >= myBirth) {
    era = "Me";
    strokes = 3;
  }

  const row = Math.floor(i / itemsPerRow);
  const col = i % itemsPerRow;

  tallies.push({
    x: startX + col * xSpacing,
    y: startY + row * ySpacing,
    strokes,
    label: `${era} — ${date.toDateString()}`
  });
}

/* ---------- DRAW ---------- */
function draw() {
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(
    -offsetX / scale,
    -offsetY / scale,
    canvas.width / scale,
    canvas.height / scale
  );

  tallies.forEach(t => {
    for (let i = 0; i < t.strokes; i++) {
      ctx.beginPath();
      ctx.moveTo(t.x + i * 6, t.y);
      ctx.lineTo(t.x + i * 6, t.y + 30);
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  });
}

draw();

/* ---------- ZOOM ---------- */
canvas.addEventListener("wheel", e => {
  e.preventDefault();

  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const zoom = e.deltaY < 0 ? 1.1 : 0.9;

  const wx = (mouseX - offsetX) / scale;
  const wy = (mouseY - offsetY) / scale;

  scale = Math.min(Math.max(scale * zoom, 0.4), 5);

  offsetX = mouseX - wx * scale;
  offsetY = mouseY - wy * scale;

  draw();
}, { passive: false });

/* ---------- PAN ---------- */
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  dragX = e.clientX - offsetX;
  dragY = e.clientY - offsetY;
});

window.addEventListener("mouseup", () => isDragging = false);

window.addEventListener("mousemove", e => {
  if (isDragging) {
    offsetX = e.clientX - dragX;
    offsetY = e.clientY - dragY;
    draw();
  }

  /* ---------- HOVER ---------- */
  const wx = (e.clientX - offsetX) / scale;
  const wy = (e.clientY - offsetY) / scale;

  let hit = null;
  tallies.forEach(t => {
    if (
      wx >= t.x - 4 &&
      wx <= t.x + t.strokes * 6 + 4 &&
      wy >= t.y &&
      wy <= t.y + 30
    ) hit = t;
  });

  if (hit) {
    tooltip.style.opacity = 1;
    tooltip.style.left = e.clientX + 12 + "px";
    tooltip.style.top = e.clientY + 12 + "px";
    tooltip.textContent = hit.label;
  } else {
    tooltip.style.opacity = 0;
  }
});
