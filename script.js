const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

const data = {
  "people": [
    { "name": "Grandmother", "dob": "1938-02-01", "colors": ["#4ade80"] },
    { "name": "Father", "dob": "1969-05-25", "colors": ["#60a5fa"] },
    { "name": "Mother", "dob": "1980-01-29", "colors": ["#fb923c"] },
    { "name": "Aunt", "dob": "1985-02-07", "colors": ["#a78bfa"] },
    { "name": "Samip", "dob": "2004-08-07", "colors": ["#22d3ee"] },
    { "name": "Kabir", "dob": "2005-04-05", "colors": ["#facc15"] },
    { "name": "Sangram", "dob": "2008-05-07", "colors": ["#f472b6"] }
  ]
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scale = 0.5; 
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let tallies = [];

init(data.people);

function init(people) {
  people.sort((a, b) => new Date(a.dob) - new Date(b.dob));
  const startDate = new Date(people[0].dob);
  const today = new Date();
  const msDay = 86400000;
  const totalDays = Math.floor((today - startDate) / msDay);

  const perRow = 50; 
  const xGap = 100; 
  const yGap = 120;

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

  // Focus on the end of the wall (Today)
  const lastTally = tallies[tallies.length - 1];
  offsetX = (canvas.width / 2) - (lastTally.x * scale);
  offsetY = (canvas.height / 2) - (lastTally.y * scale);

  draw();
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

  ctx.lineWidth = 4; // Thicker lines for better visibility
  ctx.lineCap = "round";

  tallies.forEach(t => {
    // Basic Culling for performance
    const screenX = t.x * scale + offsetX;
    const screenY = t.y * scale + offsetY;
    if (screenX < -100 || screenX > canvas.width + 100 || screenY < -100 || screenY > canvas.height + 100) return;

    t.people.forEach((p, i) => {
      ctx.strokeStyle = p.colors[0];
      ctx.beginPath();
      ctx.moveTo(t.x + (i * 12), t.y);
      ctx.lineTo(t.x + (i * 12), t.y + 40);
      ctx.stroke();
    });

    if (t.people.length >= 5) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.moveTo(t.x - 5, t.y + 35);
      ctx.lineTo(t.x + (t.people.length * 12), t.y + 5);
      ctx.stroke();
    }
  });
}

// Interactivity
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  if (e.ctrlKey || e.metaKey) {
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const mouseX = (e.clientX - offsetX) / scale;
    const mouseY = (e.clientY - offsetY) / scale;
    scale = Math.min(Math.max(scale * zoom, 0.02), 2);
    offsetX = e.clientX - mouseX * scale;
    offsetY = e.clientY - mouseY * scale;
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
  canvas.style.cursor = "grabbing";
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

window.addEventListener("mouseup", () => {
  isDragging = false;
  canvas.style.cursor = "default";
});

function handleHover(e) {
  const x = (e.clientX - offsetX) / scale;
  const y = (e.clientY - offsetY) / scale;

  for (const t of tallies) {
    if (x > t.x - 10 && x < t.x + 100 && y > t.y && y < t.y + 50) {
      tooltip.style.left = e.clientX + 15 + "px";
      tooltip.style.top = e.clientY + 15 + "px";
      tooltip.innerHTML = `<strong>${t.date.toDateString()}</strong><br>${t.people.length} People Alive`;
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
