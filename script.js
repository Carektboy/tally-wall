const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

// ---------- CANVAS SETUP ----------
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ---------- TIMELINE SETTINGS ----------
const grandmomBirth = new Date("1966-05-12");
const dadBirth = new Date(grandmomBirth);
dadBirth.setFullYear(dadBirth.getFullYear() + 18);
const myBirth = new Date(dadBirth);
myBirth.setFullYear(myBirth.getFullYear() + 20);

const today = new Date();
const msDay = 24 * 60 * 60 * 1000;
const totalDays = Math.floor((today - grandmomBirth) / msDay);

// ---------- GRID SETTINGS ----------
const itemsPerRow = 60;
const xSpacing = 14;
const ySpacing = 55;
const startX = 0;
const startY = 0;

// ---------- CAMERA ----------
let scale = 1;
let offsetX = 100;
let offsetY = 100;

// ---------- PAN STATE ----------
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// ---------- DATA ARRAY ----------
const tallies = [];

// ---------- GENERATE TALLIES DAY BY DAY ----------
for (let i = 0; i <= totalDays; i++) {
  const date = new Date(grandmomBirth.getTime() + i * msDay);

  let strokes = 1;
  let person = "Grandmom";
  if (date >= dadBirth && date < myBirth) {
    strokes = 2;
    person = "Father";
  } else if (date >= myBirth) {
    strokes = 3;
    person = "Me";
  }

  const row = Math.floor(i / itemsPerRow);
  const col = i % itemsPerRow;

  tallies.push({
    x: startX + col * xSpacing,
    y: startY + row * ySpacing,
    strokes,
    text: `${person}: ${date.toDateString()}`
  });
}

// ---------- DRAW FUNCTION ----------
function draw() {
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(
    -offsetX / scale,
    -offsetY / scale,
    canvas.width / scale,
    canvas.height / scale
  );

  tallies.forEach(t => {
    for (let s = 0; s < t.strokes; s++) {
      ctx.beginPath();
      ctx.moveTo(t.x + s * 6, t.y);
      ctx.lineTo(t.x + s * 6, t.y + 30);
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.lineWidth = 2.7;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  });
}

// ---------- ZOOM (Ctrl + wheel) ----------
canvas.addEventListener("wheel", e => {
  if (!e.ctrlKey) {
    // Normal wheel = vertical pan
    offsetY -= e.deltaY * 1.2;
    offsetX -= e.deltaX;
    draw();
    return;
  }

  e.preventDefault();
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

  const wx = (mouseX - offsetX) / scale;
  const wy = (mouseY - offsetY) / scale;

  scale = Math.min(Math.max(scale * zoomFactor, 0.4), 5);

  offsetX = mouseX - wx * scale;
  offsetY = mouseY - wy * scale;

  draw();
}, { passive: false });

// ---------- PAN (drag) ----------
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  dragStartX = e.clientX - offsetX;
  dragStartY = e.clientY - offsetY;
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

window.addEventListener("mousemove", e => {
  if (isDragging) {
    offsetX = e.clientX - dragStartX;
    offsetY = e.clientY - dragStartY;
    draw();
  }

  // ---------- HOVER TOOLTIP ----------
  const worldX = (e.clientX - offsetX) / scale;
  const worldY = (e.clientY - offsetY) / scale;
  let hit = null;

  tallies.forEach(t => {
    if (
      worldX >= t.x - 4 &&
      worldX <= t.x + t.strokes * 6 + 4 &&
      worldY >= t.y &&
      worldY <= t.y + 30
    ) hit = t;
  });

  if (hit) {
    tooltip.style.left = e.clientX + 10 + "px";
    tooltip.style.top = e.clientY + 10 + "px";
    tooltip.textContent = hit.text;
    tooltip.style.opacity = 1;
  } else {
    tooltip.style.opacity = 0;
  }
});

// ---------- INITIAL DRAW ----------
draw();
