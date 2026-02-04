const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

// initial size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// camera settings
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// panning
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// data
let tallies = [];

fetch("data.json")
  .then(res => res.json())
  .then(json => {
    tallies = json.tallies;
    draw();
  });

// drawing function
function draw() {
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(-offsetX / scale, -offsetY / scale,
                canvas.width / scale, canvas.height / scale);

  // draw marks
  tallies.forEach(t => {
    for (let i = 0; i < t.value; i++) {
      ctx.beginPath();
      ctx.moveTo(t.x + i * 8, t.y);
      ctx.lineTo(t.x + i * 8, t.y + 20);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

// mouse wheel -> zoom or scroll
canvas.addEventListener("wheel", e => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  if (e.ctrlKey) {
    // prevent default so page does not scroll
    e.preventDefault();

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.5), 5);

    // world position before zoom
    const wx = (mouseX - offsetX) / scale;
    const wy = (mouseY - offsetY) / scale;

    // update scale
    scale = newScale;

    // keep cursor point stable
    offsetX = mouseX - wx * scale;
    offsetY = mouseY - wy * scale;

    draw();
  }
});

// dragging -> pan
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  dragStartX = e.clientX - offsetX;
  dragStartY = e.clientY - offsetY;
});

window.addEventListener("mouseup", () => isDragging = false);

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
    // simple bounding box hit-test
    if (worldX >= t.x - 10 && worldX <= t.x + t.value * 8 + 10 &&
        worldY >= t.y - 10 && worldY <= t.y + 30) {
      found = t;
    }
  });

  if (found) {
    tooltip.style.opacity = 1;
    tooltip.style.left = e.clientX + 12 + "px";
    tooltip.style.top = e.clientY + 12 + "px";
    tooltip.innerHTML = `<b>${found.label}</b><br>Count: ${found.value}`;
  } else {
    tooltip.style.opacity = 0;
  }
});

// resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});
