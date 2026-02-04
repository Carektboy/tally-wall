// 1. FIX: Changed ID to "tallyCanvas" to match your HTML
const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

// 2. EMBEDDED DATA: Prevents 404/Fetch errors on GitHub Pages
const data = {
  "people": [
    { "name": "Grandmother", "dob": "1938-02-01", "colors": ["#2e7d32"] },
    { "name": "Father", "dob": "1969-05-25", "colors": ["#1565c0"] },
    { "name": "Mother", "dob": "1980-01-29", "colors": ["#ef6c00"] },
    { "name": "Aunt", "dob": "1985-02-07", "colors": ["#8e24aa"] },
    { "name": "Samip", "dob": "2004-08-07", "colors": ["#00acc1"] },
    { "name": "Kabir", "dob": "2005-04-05", "colors": ["#c0ca33"] },
    { "name": "Sangram", "dob": "2008-05-07", "colors": ["#d81b60"] }
  ]
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scale = 0.8; // Zoom out a bit by default
let offsetX = 50;
let offsetY = 50;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let tallies = [];

// Initialize immediately
init(data.people);

function init(people) {
  // Sort by age
  people.sort((a, b) => new Date(a.dob) - new Date(b.dob));
  
  const startDate = new Date(people[0].dob);
  const today = new Date();
  const msDay = 86400000;
  const totalDays = Math.floor((today - startDate) / msDay);

  const perRow = 40; 
  const xGap = 80; // Space for up to 7 people + slash
  const yGap = 100;

  tallies = [];

  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(startDate.getTime() + i * msDay);
    const row = Math.floor(i / perRow);
    const col = i % perRow;

    const activePeople = people.filter(p => new Date(p.dob) <= date);

    tallies.push({
      x: col * xGap,
      y: row * yGap,
      date,
      people: activePeople
    });
  }
  draw();
}

function draw() {
  ctx.save();
  // Clear and apply camera
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  tallies.forEach(t => {
    // Only draw if visible (Simple culling)
    const vx = (t.x * scale) + offsetX;
    const vy = (t.y * scale) + offsetY;
    if (vx < -200 || vx > canvas.width + 200 || vy < -200 || vy > canvas.height + 200) return;

    t.people.forEach((p, i) => {
      ctx.strokeStyle = p.colors[0];
      ctx.beginPath();
      ctx.moveTo(t.x + (i * 10), t.y);
      ctx.lineTo(t.x + (i * 10), t.y + 30);
      ctx.stroke();
    });

    if (t.people.length >= 5) {
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(t.x - 5, t.y + 25);
      ctx.lineTo(t.x + (t.people.length * 10), t.y + 5);
      ctx.stroke();
    }
  });
  ctx.restore();
}

// Interactivity
canvas.addEventListener("wheel", e => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    scale = Math.min(Math.max(scale * zoom, 0.05), 3);
  } else {
    offsetX -= e.deltaX;
    offsetY -= e.deltaY;
  }
  draw();
}, { passive: false });

canvas.addEventListener("mousedown", e => {
  isDragging = true;
  dragStart.x = e.clientX - offsetX;
  dragStart.y = e.clientY - offsetY;
});

window.addEventListener("mousemove", e => {
  if (isDragging) {
    offsetX = e.clientX - dragStart.x;
    offsetY = e.clientY - dragStart.y;
    draw();
  } else {
    handleHover(e);
  }
});

window.addEventListener("mouseup", () => isDragging = false);

function handleHover(e) {
  const x = (e.clientX - offsetX) / scale;
  const y = (e.clientY - offsetY) / scale;

  for (const t of tallies) {
    if (x > t.x - 10 && x < t.x + 80 && y > t.y && y < t.y + 40) {
      tooltip.style.left = e.clientX + 15 + "px";
      tooltip.style.top = e.clientY + 15 + "px";
      tooltip.innerHTML = `<strong>${t.date.toDateString()}</strong><br>${t.people.map(p => p.name).join(", ")}`;
      tooltip.style.opacity = 1;
      return;
    }
  }
  tooltip.style.opacity = 0;
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});
