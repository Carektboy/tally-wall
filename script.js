const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

const data = {
  "people": [
    { "name": "Grandmother", "dob": "1938-02-01", "colors": ["#2d5a27"] },
    { "name": "Father", "dob": "1969-05-25", "colors": ["#1e3a8a"] },
    { "name": "Mother", "dob": "1980-01-29", "colors": ["#9a3412"] },
    { "name": "Aunt", "dob": "1985-02-07", "colors": ["#5b21b6"] },
    { "name": "Samip", "dob": "2004-08-07", "colors": ["#0369a1"] },
    { "name": "Kabir", "dob": "2005-04-05", "colors": ["#854d0e"] },
    { "name": "Sangram", "dob": "2008-05-07", "colors": ["#9d174d"] }
  ]
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scale = 0.6; 
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

  const perRow = 30; // Fewer items per row makes it easier to read
  const xGap = 120; 
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

  // Focus on the end of the wall (Today) so you see all people immediately
  const lastTally = tallies[tallies.length - 1];
  offsetX = (canvas.width / 2) - (lastTally.x * scale);
  offsetY = (canvas.height / 2) - (lastTally.y * scale);

  draw();
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears to peach CSS background
  
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  tallies.forEach(t => {
    // Performance Culling
    const screenX = t.x * scale + offsetX;
    const screenY = t.y * scale + offsetY;
    if (screenX < -200 || screenX > canvas.width + 200 || screenY < -200 || screenY > canvas.height + 200) return;

    // Draw individual tallies
    t.people.forEach((p, i) => {
      ctx.strokeStyle = p.colors[0];
      ctx.beginPath();
      ctx.moveTo(t.x + (i * 14), t.y);
      ctx.lineTo(t.x + (i * 14), t.y + 40);
      ctx.stroke();
    });

    // Draw the strike-through slash for groups of 5+
    if (t.people.length >= 5) {
      ctx.strokeStyle = "#4a3728"; // Dark brown slash
      ctx.beginPath();
      ctx.moveTo(t.x - 5, t.y + 35);
      ctx.lineTo(t.x + (t.people.length * 14), t.y + 5);
      ctx.stroke();
    }
  });
}

// Controls
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  if (e.ctrlKey || e.metaKey) {
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const mouseX = (e.clientX - offsetX) / scale;
    const mouseY = (e.clientY - offsetY) / scale;
    scale = Math.min(Math.max(scale * zoom, 0.01), 3);
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
    if (x > t.x - 10 && x < t.x + 100 && y > t.y && y < t.y + 60) {
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
