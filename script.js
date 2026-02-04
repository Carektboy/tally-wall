const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// camera state
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// pan state
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// data
let tallies = [];

// load data.json
fetch("./data.json")
  .then(res => res.json())
  .then(json => {
    tallies = json.tallies;
    draw();
  });

// draw contents
function draw() {
  // clear and reset transform
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(
    -offsetX / scale,
    -offsetY / scale,
    canvas.width / scale,
    canvas.height / scale
  );

  // draw each tally
  tallies.forEach(t => {
    for (let i = 0; i < t.value; i++) {
      ctx.beginPath();
      ctx.moveTo(t.x + i * 8, t.y);
      ctx.lineTo(t.x + i * 8, t.y + 20);
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  });
}

// zoom around cursor
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const zoomIntensity = 1.1;
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const wheel = e.deltaY < 0 ? 1 : -1;

  // compute scale
  const zoom = wheel > 0 ? zoomIntensity : 1 / zoomIntensity;
  const newScale = Math.min(Math.max(scale * zoom, 0.5), 5);

  // world coords under cursor before zoom
  const wx = (mouseX - offsetX) / scale;
  const wy = (mouseY - offsetY) / scale;

  scale = newScale;

  // adjust offsets so point under cursor stays
  offsetX = mouseX - wx * scale;
  offsetY = mouseY - wy * scale;

  draw();
}, { passive: false });

// pan with mouse drag
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  dragStartX = e.clientX - offsetX;
  dragStartY = e.clientY - offsetY;
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

window.addEventListener("mousemove", e => {
  if (isDragging) {
    offsetX = e.clientX - dragStartX;
    offsetY = e.clientY - dragStartY;
    draw();
  }

  // hover detection
  const worldX = (e.clientX - offsetX) / scale;
  const worldY = (e.clientY - offsetY) / scale;
  let found = null;

  tallies.forEach(t => {
    // basic hit-test area
    if (
      worldX >= t.x - 10 &&
      worldX <= t.x + t.value * 8 + 10 &&
      worldY >= t.y - 10 &&
      worldY <= t.y + 30
    ) {
      found = t;
    }
  });

  if (found) {
    tooltip.style.opacity = 1;
    tooltip.style.left = e.clientX + 12 + "px";
    tooltip.style.top = e.clientY + 12 + "px";
    tooltip.innerHTML = `<b>${found.label}</b>`;
  } else {
    tooltip.style.opacity = 0;
  }
});

// adjust canvas on resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});
