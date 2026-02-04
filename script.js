const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scale = 1;
let offsetX = 0;
let offsetY = 0;

let isDragging = false;
let dragStart = { x: 0, y: 0 };

let tallies = [];
let contentWidth = 0;
let contentHeight = 0;

// ---------- LOAD DATA ----------
fetch("data.json")
  .then(r => r.json())
  .then(data => init(data.people));

function init(people) {
  const startDate = new Date(people[0].date);
  const today = new Date();
  const msDay = 86400000;
  const totalDays = Math.floor((today - startDate) / msDay);

  const perRow = 40;          // wider spacing
  const xGap = 34;
  const yGap = 60;

  tallies = [];

  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(startDate.getTime() + i * msDay);
    const row = Math.floor(i / perRow);
    const col = i % perRow;

    const activePeople = people.filter(p => new Date(p.date) <= date);

    tallies.push({
      x: col * xGap,
      y: row * yGap,
      date,
      people: activePeople
    });
  }

  const last = tallies[tallies.length - 1];
  contentWidth = last.x + 300;
  contentHeight = last.y + 300;

  offsetX = canvas.width / 2;
  offsetY = 100;

  draw();
}

// ---------- DRAW ----------
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
    t.people.forEach((p, i) => {
      ctx.strokeStyle = p.color;

      ctx.beginPath();
      ctx.moveTo(t.x + i * 8, t.y);
      ctx.lineTo(t.x + i * 8, t.y + 28);
      ctx.stroke();
    });

    // Prisoner slash after 5th
    if (t.people.length >= 5) {
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(t.x - 2, t.y + 30);
      ctx.lineTo(t.x + 34, t.y - 4);
      ctx.stroke();
    }
  });
}

// ---------- ZOOM & SCROLL ----------
canvas.addEventListener("wheel", e => {
  if (e.ctrlKey) {
    e.preventDefault();

    const zoom = e.deltaY < 0 ? 1.08 : 0.92;
    const wx = (e.clientX - offsetX) / scale;
    const wy = (e.clientY - offsetY) / scale;

    scale *= zoom;
    scale = Math.min(Math.max(scale, 0.25), 12);

    offsetX = e.clientX - wx * scale;
    offsetY = e.clientY - wy * scale;

    clampCamera();
    draw();
  } else {
    offsetX -= e.deltaX;
    offsetY -= e.deltaY;
    clampCamera();
    draw();
  }
}, { passive: false });

// ---------- DRAG ----------
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

window.addEventListener("mouseup", () => isDragging = false);

// ---------- TOOLTIP ----------
function handleHover(e) {
  const x = (e.clientX - offsetX) / scale;
  const y = (e.clientY - offsetY) / scale;

  for (const t of tallies) {
    if (x > t.x - 6 && x < t.x + 40 && y > t.y && y < t.y + 30) {
      tooltip.style.left = e.clientX + 12 + "px";
      tooltip.style.top = e.clientY + 12 + "px";
      tooltip.textContent =
        t.date.toDateString() + " — " +
        t.people.map(p => p.name).join(", ");
      tooltip.style.opacity = 1;
      return;
    }
  }
  tooltip.style.opacity = 0;
}

// ---------- CAMERA CLAMP ----------
function clampCamera() {
  const minX = canvas.width - contentWidth * scale;
  const minY = canvas.height - contentHeight * scale;

  offsetX = Math.min(0, Math.max(offsetX, minX));
  offsetY = Math.min(0, Math.max(offsetY, minY));
}

// ---------- RESIZE ----------
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});
