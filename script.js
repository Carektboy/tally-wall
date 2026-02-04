const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

// ===== VIEW STATE =====
let scale = 1;
let offsetX = 80;
let offsetY = 80;
let isDragging = false;
let startX = 0;
let startY = 0;

// ===== LAYOUT SETTINGS =====
const GAP_X = 40;        // horizontal gap between tallies
const GAP_Y = 110;       // vertical gap between rows
const LINE_HEIGHT = 55;
const LINE_GAP = 8;      // gap between strokes inside one tally
const MAX_ZOOM = 10;
const MIN_ZOOM = 0.4;

// ===== DATA =====
let people = [];
let tallies = [];

// ===== RESIZE =====
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ===== LOAD DATA =====
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    people = data.people.map(p => ({
      name: p.name,
      dob: new Date(p.dob),
      colors: p.colors
    }));
    generateTallies();
    draw();
  });

// ===== GENERATE TALLIES (1 per year from first DOB) =====
function generateTallies() {
  tallies = [];

  const startDate = people[0].dob;
  const today = new Date();
  const years = today.getFullYear() - startDate.getFullYear();

  for (let i = 0; i <= years; i++) {
    const date = new Date(startDate);
    date.setFullYear(startDate.getFullYear() + i);

    const activePeople = people.filter(p => date >= p.dob);

    const row = Math.floor(i / 25);
    const col = i % 25;

    tallies.push({
      x: col * GAP_X,
      y: row * GAP_Y,
      date,
      people: activePeople
    });
  }
}

// ===== DRAW =====
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.lineCap = "round";
  ctx.lineWidth = 3;

  tallies.forEach(t => {
    t.people.forEach((p, i) => {
      ctx.strokeStyle = p.colors[i % p.colors.length];
      ctx.beginPath();
      ctx.moveTo(t.x + i * LINE_GAP, t.y);
      ctx.lineTo(t.x + i * LINE_GAP, t.y + LINE_HEIGHT);
      ctx.stroke();
    });
  });
}

// ===== ZOOM & PAN =====
canvas.addEventListener("wheel", e => {
  if (e.ctrlKey) {
    e.preventDefault();

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const mouseX = (e.clientX - offsetX) / scale;
    const mouseY = (e.clientY - offsetY) / scale;

    scale *= zoomFactor;
    scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));

    offsetX = e.clientX - mouseX * scale;
    offsetY = e.clientY - mouseY * scale;
  } else {
    offsetX -= e.deltaX;
    offsetY -= e.deltaY;
  }

  draw();
}, { passive: false });

// ===== DRAG =====
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
});

window.addEventListener("mousemove", e => {
  if (isDragging) {
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    draw();
  } else {
    handleHover(e);
  }
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

// ===== HOVER TOOLTIP =====
function handleHover(e) {
  const wx = (e.clientX - offsetX) / scale;
  const wy = (e.clientY - offsetY) / scale;

  let hit = null;

  for (const t of tallies) {
    const width = t.people.length * LINE_GAP;
    if (
      wx >= t.x - 5 &&
      wx <= t.x + width + 5 &&
      wy >= t.y &&
      wy <= t.y + LINE_HEIGHT
    ) {
      hit = t;
      break;
    }
  }

  if (hit) {
    tooltip.style.opacity = 1;
    tooltip.style.left = e.clientX + 12 + "px";
    tooltip.style.top = e.clientY + 12 + "px";
    tooltip.textContent =
      hit.date.getFullYear() + " — " +
      hit.people.map(p => p.name).join(", ");
  } else {
    tooltip.style.opacity = 0;
  }
}
