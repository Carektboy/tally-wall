const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

// ---------- CANVAS SIZE (CRITICAL FIX)
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ---------- CAMERA
let scale = 1;
let offsetX = 200;
let offsetY = 200;

// ---------- PAN STATE
let isDragging = false;
let startX = 0;
let startY = 0;

// ---------- DATA
let tallies = [];

// ---------- LOAD DATA
fetch("./data.json")
  .then(r => r.json())
  .then(data => {
    tallies = data.tallies;
    draw();
  });

// ---------- DRAW
function draw() {
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(
    -offsetX / scale,
    -offsetY / scale,
    canvas.width / scale,
    canvas.height / scale
  );

  tallies.forEach(t => {
    for (let i = 0; i < t.value; i++) {
      ctx.beginPath();
      ctx.moveTo(t.x + i * 8, t.y);
      ctx.lineTo(t.x + i * 8, t.y + 30);
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  });
}

// ---------- ZOOM (ANCHOR TO CURSOR)
canvas.addEventListener("wheel", e => {
  e.preventDefault();

  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const zoom = e.deltaY < 0 ? 1.1 : 0.9;

  const wx = (mouseX - offsetX) / scale;
  const wy = (mouseY - offsetY) / scale;

  scale = Math.min(Math.max(scale * zoom, 0.4), 6);

  offsetX = mouseX - wx * scale;
  offsetY = mouseY - wy * scale;

  draw();
}, { passive: false });

// ---------- PAN
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

window.addEventListener("mousemove", e => {
  if (isDragging) {
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    draw();
  }

  // ---------- HOVER
  const wx = (e.clientX - offsetX) / scale;
  const wy = (e.clientY - offsetY) / scale;

  let hit = null;
  tallies.forEach(t => {
    if (
      wx >= t.x - 5 &&
      wx <= t.x + t.value * 8 + 5 &&
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
