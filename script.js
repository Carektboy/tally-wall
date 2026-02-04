const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

canvas.width = 3000;
canvas.height = 2000;

let scale = 1;
let offsetX = 0;
let offsetY = 0;

let isPanning = false;
let startX, startY;

let data = [];

fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json.tallies;
    draw();
  });

function draw() {
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(
    -offsetX / scale,
    -offsetY / scale,
    canvas.width / scale,
    canvas.height / scale
  );

  data.forEach(item => {
    ctx.beginPath();
    ctx.arc(item.x, item.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#4ea1ff";
    ctx.fill();
  });
}

/* -------- ZOOM (towards mouse) -------- */
canvas.addEventListener("wheel", e => {
  if (!e.ctrlKey) return; // allow normal page scroll
  e.preventDefault();

  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  const worldX = (mouseX - offsetX) / scale;
  const worldY = (mouseY - offsetY) / scale;

  scale *= zoom;

  offsetX = mouseX - worldX * scale;
  offsetY = mouseY - worldY * scale;

  draw();
}, { passive: false });

/* -------- PAN -------- */
canvas.addEventListener("mousedown", e => {
  isPanning = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
});

window.addEventListener("mouseup", () => {
  isPanning = false;
});

window.addEventListener("mousemove", e => {
  if (!isPanning) return;
  offsetX = e.clientX - startX;
  offsetY = e.clientY - startY;
  draw();
});

/* -------- HOVER TOOLTIP -------- */
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left - offsetX) / scale;
  const my = (e.clientY - rect.top - offsetY) / scale;

  let found = false;

  data.forEach(item => {
    const dx = mx - item.x;
    const dy = my - item.y;
    if (Math.sqrt(dx * dx + dy * dy) < 15) {
      tooltip.style.display = "block";
      tooltip.style.left = e.clientX + 10 + "px";
      tooltip.style.top = e.clientY + 10 + "px";
      tooltip.innerHTML = `<b>${item.label}</b><br>Value: ${item.value}`;
      found = true;
    }
  });

  if (!found) tooltip.style.display = "none";
});
