const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// -------- ERA COLORS --------
const ERA_COLORS = {
  grandma: ["#2e7d32"],                 // green
  father: ["#2e7d32", "#1565c0"],        // green + blue
  me: ["#2e7d32", "#1565c0", "#ef6c00"]  // green + blue + orange
};

// -------- CAMERA --------
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isPanning = false;
let startPan = { x: 0, y: 0 };

// -------- LOAD DATA --------
fetch("data.json")
  .then(r => r.json())
  .then(data => init(data));

let tallies = [];

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
  const xGap = 24;
  const yGap = 50;

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

  centerView();
  draw();
}

// -------- DRAW --------
function draw() {
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(-offsetX / scale, -offsetY / scale, canvas.width / scale, canvas.height / scale);

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

// -------- CENTER VIEW --------
function centerView() {
  offsetX = canvas.width / 2;
  offsetY = 80;
}

// -------- ZOOM (CENTERED ON MOUSE) --------
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const zoom = e.deltaY < 0 ? 1.15 : 0.85;

  const mx = e.clientX;
  const my = e.clientY;

  offsetX = mx - (mx - offsetX) * zoom;
  offsetY = my - (my - offsetY) * zoom;

  scale *= zoom;
  scale = Math.min(Math.max(scale, 0.2), 6);

  draw();
}, { passive: false });

// -------- PAN --------
canvas.addEventListener("mousedown", e => {
  isPanning = true;
  startPan.x = e.clientX - offsetX;
  startPan.y = e.clientY - offsetY;
});

window.addEventListener("mousemove", e => {
  if (isPanning) {
    offsetX = e.clientX - startPan.x;
    offsetY = e.clientY - startPan.y;
    draw();
  } else {
    handleHover(e);
  }
});

window.addEventListener("mouseup", () => isPanning = false);

// -------- HOVER --------
function handleHover(e) {
  const x = (e.clientX - offsetX) / scale;
  const y = (e.clientY - offsetY) / scale;

  for (const t of tallies) {
    if (
      x > t.x - 5 && x < t.x + 20 &&
      y > t.y && y < t.y + 30
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

// -------- RESIZE --------
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});
