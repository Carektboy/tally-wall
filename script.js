const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// -------- ERA COLORS --------
const ERA_COLORS = {
  grandma: ["#2e7d32"],
  father: ["#2e7d32", "#1565c0"],
  me: ["#2e7d32", "#1565c0", "#ef6c00"]
};

// -------- CAMERA --------
let scale = 1;
let offsetX = 0;
let offsetY = 0;

let isDragging = false;
let dragStart = { x: 0, y: 0 };

// -------- DATA --------
let tallies = [];

// -------- LOAD DATA --------
fetch("data.json")
  .then(res => res.json())
  .then(data => init(data));

function init(data) {
  const grandmaBirth = new Date(data.grandmomBirth);
  const dadBirth = new Date(grandmaBirth);
  dadBirth.setFullYear(dadBirth.getFullYear() + data.dadBirthOffsetYears);

  const myBirth = new Date(dadBirth);
  myBirth.setFullYear(myBirth.getFullYear() + data.myBirthOffsetYears);

  const today = new Date();
  const msDay = 86400000;
  const totalDays = Math.floor((today - grandmaBirth) / msDay);

  const perRow = 50;
  const xGap = 26;
  const yGap = 52;

  tallies = [];

  for (let i = 0; i <= totalDays; i++) {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const date = new Date(grandmaBirth.getTime() + i * msDay);

    let era = "grandma";
    let strokes = 1;

    if (date >= dadBirth && date < myBirth) {
      era = "father";
      strokes = 2;
    } else if (date >= myBirth) {
      era = "me";
      strokes = 3;
    }

    tallies.push({
      x: col * xGap,
      y: row * yGap,
      era,
      strokes,
      label: `${era.toUpperCase()} — ${date.toDateString()}`
    });
  }

  // Initial camera position
  offsetX = canvas.width / 2;
  offsetY = 80;

  draw();
}

// -------- DRAW --------
function draw() {
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(
    -offsetX / scale,
    -offsetY / scale,
    canvas.width / scale,
    canvas.height / scale
  );

  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  tallies.forEach(t => {
    const colors = ERA_COLORS[t.era];
    for (let i = 0; i < t.strokes; i++) {
      ctx.strokeStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(t.x + i * 7, t.y);
      ctx.lineTo(t.x + i * 7, t.y + 26);
      ctx.stroke();
    }
  });
}

// -------- ZOOM + SCROLL --------
canvas.addEventListener("wheel", e => {
  if (e.ctrlKey) {
    // ---- ZOOM ----
    e.preventDefault();

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;

    const worldX = (e.clientX - offsetX) / scale;
    const worldY = (e.clientY - offsetY) / scale;

    scale *= zoomFactor;
    scale = Math.min(Math.max(scale, 0.2), 12);

    offsetX = e.clientX - worldX * scale;
    offsetY = e.clientY - worldY * scale;

    draw();
  } else {
    // ---- SCROLL / PAN ----
    offsetX -= e.deltaX;
    offsetY -= e.deltaY;

    clampCamera();
    draw();
  }
}, { passive: false });

// -------- DRAG PAN (OPTIONAL) --------
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  dragStart.x = e.clientX - offsetX;
  dragStart.y = e.clientY - offsetY;
});

window.addEventListener("mousemove", e => {
  if (isDragging) {
    offsetX = e.clientX - dragStart.x;
    offsetY = e.clientY - dragStart.y;
    clampCamera();
    draw();
  } else {
    handleHover(e);
  }
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

// -------- HOVER --------
function handleHover(e) {
  const x = (e.clientX - offsetX) / scale;
  const y = (e.clientY - offsetY) / scale;

  for (const t of tallies) {
    if (
      x > t.x - 6 &&
      x < t.x + 20 &&
      y > t.y &&
      y < t.y + 30
    ) {
      tooltip.style.left = e.clientX + 12 + "px";
      tooltip.style.top = e.clientY + 12 + "px";
      tooltip.textContent = t.label;
      tooltip.style.opacity = 1;
      return;
    }
  }
  tooltip.style.opacity = 0;
}

// -------- CAMERA LIMITS --------
function clampCamera() {
  const limit = 8000;
  offsetX = Math.max(-limit, Math.min(offsetX, limit));
  offsetY = Math.max(-limit, Math.min(offsetY, limit));
}

// -------- RESIZE --------
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});
