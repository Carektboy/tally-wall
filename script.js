const svg = document.getElementById("wall");
const tooltip = document.getElementById("tooltip");

// --- DATE SETUP ---
const gMomBirth = new Date("1966-05-12");
const dadBirth = new Date(gMomBirth);
dadBirth.setFullYear(dadBirth.getFullYear() + 18);

const myBirth = new Date(dadBirth);
myBirth.setFullYear(myBirth.getFullYear() + 20);

const today = new Date();
const msInDay = 24 * 60 * 60 * 1000;
const totalDays = Math.floor((today - gMomBirth) / msInDay);

// --- GRID SETTINGS ---
const itemsPerRow = 60;
const baseXSpacing = 32;
const baseYSpacing = 70;
const startX = 60;
const startY = 40;

// --- ZOOM STATE ---
let zoom = 1;
let targetZoom = 1;

// --- DATA ---
const tallies = [];

// --- CREATE ONCE ---
for (let i = 0; i < totalDays; i++) {
  const row = Math.floor(i / itemsPerRow);
  const col = i % itemsPerRow;

  const baseX = startX + col * baseXSpacing;
  const baseY = startY + row * baseYSpacing;

  const currentDay = new Date(gMomBirth.getTime() + i * msInDay);

  let era = "Grandmother";
  let strokes = 1;
  if (currentDay >= dadBirth && currentDay < myBirth) {
    era = "Father"; strokes = 2;
  } else if (currentDay >= myBirth) {
    era = "Me"; strokes = 3;
  }

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

  for (let s = 0; s < strokes; s++) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `
      M ${baseX + s * 8} ${baseY}
      c 4 -8 8 0 0 16
      c -8 16 -4 24 0 16
    `;
    path.setAttribute("d", d);
    path.classList.add("tally");
    group.appendChild(path);
  }

  group.dataset.baseX = baseX;
  group.dataset.baseY = baseY;
  group.dataset.row = row;
  group.dataset.col = col;

  group.addEventListener("mouseenter", () => {
    tooltip.textContent = `${era}: ${currentDay.toDateString()}`;
    tooltip.style.opacity = 1;
  });
  group.addEventListener("mousemove", e => {
    tooltip.style.left = e.clientX + 15 + "px";
    tooltip.style.top = e.clientY + 15 + "px";
  });
  group.addEventListener("mouseleave", () => tooltip.style.opacity = 0);

  svg.appendChild(group);
  tallies.push(group);
}

// --- APPLY SPACING ONLY ---
function applyZoom() {
  zoom += (targetZoom - zoom) * 0.15;

  tallies.forEach(g => {
    const col = +g.dataset.col;
    const row = +g.dataset.row;

    const dx = col * baseXSpacing * (zoom - 1);
    const dy = row * baseYSpacing * (zoom - 1);

    g.setAttribute(
      "transform",
      `translate(${dx}, ${dy})`
    );
  });

  requestAnimationFrame(applyZoom);
}

// --- WHEEL ZOOM ---
svg.addEventListener("wheel", e => {
  e.preventDefault();
  targetZoom += e.deltaY < 0 ? 0.15 : -0.15;
  targetZoom = Math.min(Math.max(targetZoom, 1), 3);
}, { passive: false });

// --- SVG SIZE ---
const rows = Math.ceil(totalDays / itemsPerRow);
const width = startX + itemsPerRow * baseXSpacing + 80;
const height = startY + rows * baseYSpacing;

svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
svg.style.width = width + "px";
svg.style.height = height + "px";

// --- START ---
applyZoom();
