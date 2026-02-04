const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// CAMERA
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// GRID
const PER_ROW = 60;
const SPACING_X = 28;
const SPACING_Y = 60;
const START_X = 80;
const START_Y = 80;

// DATA
let tallies = [];

// LOAD DATA
fetch("data.json")
  .then(res => res.json())
  .then(init);

// INIT
function init(data) {
  const startDate = new Date(data.startDate);
  const today = new Date();
  const DAY = 86400000;
  const totalDays = Math.floor((today - startDate) / DAY);

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate.getTime() + i * DAY);

    let person = data.people.find(p =>
      date >= new Date(p.from) && date < new Date(p.to)
    );

    if (!person) continue;

    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;

    tallies.push({
      x: START_X + col * SPACING_X,
      y: START_Y + row * SPACING_Y,
      strokes: person.strokes,
      label: `${person.name} — ${date.toDateString()}`
    });
  }

  draw();
}

// DRAW
function draw() {
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(
    -offsetX / scale,
    -offsetY / scale,
    canvas.width / scale,
    canvas.height / scale
  );

  ctx.strokeStyle = "rgba(0,0,0,0.85)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  tallies.forEach(t => {
    for (let i = 0; i < t.strokes; i++) {
      ctx.beginPath();
      ctx.moveTo(t.x + i * 8, t.y);
      ctx.bezierCurveTo(
        t.x + i * 8 + 4, t.y - 10,
        t.x + i * 8 + 8, t.y + 10,
        t.x + i * 8, t.y + 30
      );
      ctx.stroke();
    }
  });
}

// HIT TEST
function findTally(mx, my) {
  const x = (mx - offsetX) / scale;
  const y = (my - offsetY) / scale;

  return tallies.find(t =>
    x > t.x - 5 &&
    x < t.x + 20 &&
    y > t.y - 10 &&
    y < t.y + 40
  );
}

// MOUSE MOVE (HOVER)
canvas.addEventListener("mousemove", e => {
  const t = findTally(e.clientX, e.clientY);
  if (t) {
    tooltip.textContent = t.label;
    tooltip.style.left = e.clientX + 12 + "px";
    tooltip.style.top = e.clientY + 12 + "px";
    tooltip.style.opacity = 1;
  } else {
    tooltip.style.opacity = 0;
  }
});

// PAN + ZOOM
canvas.addEventListener("wheel", e => {
  if (e.ctrlKey) {
    e.preventDefault();
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    scale *= zoom;
    scale = Math.min(Math.max(scale, 0.6), 4);
  } else {
    offsetY -= e.deltaY;
    offsetX -= e.deltaX;
  }
  draw();
}, { passive: false });

// RESIZE
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});
