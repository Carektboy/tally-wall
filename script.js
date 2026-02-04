const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- CAMERA ---
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// --- DATA ---
const gMomBirth = new Date("1966-05-12");
const dadBirth = new Date(gMomBirth); dadBirth.setFullYear(dadBirth.getFullYear() + 18);
const myBirth = new Date(dadBirth); myBirth.setFullYear(myBirth.getFullYear() + 20);

const today = new Date();
const msInDay = 86400000;
const totalDays = Math.floor((today - gMomBirth) / msInDay);

// --- GRID ---
const perRow = 60;
const spacingX = 28;
const spacingY = 60;
const startX = 80;
const startY = 80;

const tallies = [];

for (let i = 0; i < totalDays; i++) {
  const row = Math.floor(i / perRow);
  const col = i % perRow;

  const date = new Date(gMomBirth.getTime() + i * msInDay);

  let strokes = 1;
  let label = "Grandmother";
  if (date >= dadBirth && date < myBirth) { strokes = 2; label = "Father"; }
  else if (date >= myBirth) { strokes = 3; label = "Me"; }

  tallies.push({
    x: startX + col * spacingX,
    y: startY + row * spacingY,
    strokes,
    label,
    date: date.toDateString()
  });
}

// --- DRAW ---
function draw() {
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(-offsetX / scale, -offsetY / scale, canvas.width / scale, canvas.height / scale);

  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(0,0,0,0.85)";

  tallies.forEach(t => {
    for (let s = 0; s < t.strokes; s++) {
      ctx.beginPath();
      ctx.moveTo(t.x + s * 8, t.y);
      ctx.bezierCurveTo(
        t.x + s * 8 + 4, t.y - 10,
        t.x + s * 8 + 8, t.y + 10,
        t.x + s * 8, t.y + 30
      );
      ctx.stroke();
    }
  });
}

// --- ZOOM ---
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  scale *= zoom;
  scale = Math.min(Math.max(scale, 0.6), 4);
  draw();
}, { passive: false });

// --- RESIZE ---
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});

draw();
