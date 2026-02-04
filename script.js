const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

let scale = 1;
let offsetX = 80;
let offsetY = 80;
let isDragging = false;
let startX, startY;

const GAP_X = 26;        // space between tallies
const GAP_Y = 90;        // space between people
const LINE_HEIGHT = 50;
const MAX_ZOOM = 6;
const MIN_ZOOM = 0.6;

resize();
window.addEventListener("resize", resize);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

fetch("data.json")
  .then(r => r.json())
  .then(data => {
    window.people = data.people.map(p => {
      const years =
        Math.floor((Date.now() - new Date(p.dob)) / (1000 * 60 * 60 * 24 * 365));
      return { ...p, count: years };
    });
    draw();
  });

function draw() {
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.setTransform(scale,0,0,scale,offsetX,offsetY);

  let y = 0;

  people.forEach(person => {
    drawTallies(person, 0, y);
    y += GAP_Y;
  });
}

function drawTallies(person, x, y) {
  ctx.fillStyle = "#fff";
  ctx.fillText(person.name, x, y - 10);

  for (let i = 0; i < person.count; i++) {
    const tx = x + i * GAP_X;

    if ((i + 1) % 5 === 0) {
      // Prisoner cross
      ctx.strokeStyle = "#ff4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx - GAP_X * 4, y + LINE_HEIGHT);
      ctx.lineTo(tx, y);
      ctx.stroke();
    } else {
      const color = person.colors[i % person.colors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx, y);
      ctx.lineTo(tx, y + LINE_HEIGHT);
      ctx.stroke();
    }
  }
}

/* ───────── Zoom (Ctrl + Scroll only) ───────── */
canvas.addEventListener("wheel", e => {
  if (!e.ctrlKey) return;

  e.preventDefault();

  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale * zoom));

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left - offsetX) / scale;
  const my = (e.clientY - rect.top - offsetY) / scale;

  scale = newScale;
  offsetX = e.clientX - mx * scale;
  offsetY = e.clientY - my * scale;

  draw();
}, { passive: false });

/* ───────── Drag to pan ───────── */
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
});

window.addEventListener("mouseup", () => isDragging = false);

window.addEventListener("mousemove", e => {
  if (!isDragging) return;
  offsetX = e.clientX - startX;
  offsetY = e.clientY - startY;
  draw();
});
