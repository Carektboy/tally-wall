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

// --- BASE GRID (DO NOT CHANGE LATER) ---
const itemsPerRow = 60;
const baseXSpacing = 32;
const baseYSpacing = 70;
const startX = 60;
const startY = 40;

// --- ZOOM STATE ---
let zoomScale = 1;

// --- DATA ---
const tallies = [];

for (let i = 0; i < totalDays; i++) {
  const currentDay = new Date(gMomBirth.getTime() + i * msInDay);

  let era = "Grandmother";
  let strokes = 1;

  if (currentDay >= dadBirth && currentDay < myBirth) {
    era = "Father";
    strokes = 2;
  } else if (currentDay >= myBirth) {
    era = "Me";
    strokes = 3;
  }

  tallies.push({
    index: i,
    rotation: Math.random() * 10 - 5,
    strokeCount: strokes,
    note: `${era}: ${currentDay.toDateString()}`
  });
}

// --- DRAW ---
function drawWall() {
  svg.innerHTML = "";

  const xSpacing = baseXSpacing * zoomScale;
  const ySpacing = baseYSpacing * zoomScale;

  tallies.forEach(t => {
    const row = Math.floor(t.index / itemsPerRow);
    const col = t.index % itemsPerRow;

    const x = startX + col * xSpacing;
    const y = startY + row * ySpacing;

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    for (let s = 0; s < t.strokeCount; s++) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const xOffset = s * 8 * zoomScale;

      const d = `
        M ${x + xOffset} ${y}
        c 4 -8 8 0 0 16
        c -8 16 -4 24 0 16
      `;

      path.setAttribute("d", d);
      path.classList.add("tally");
      group.appendChild(path);
    }

    group.setAttribute(
      "transform",
      `rotate(${t.rotation}, ${x}, ${y})`
    );

    group.addEventListener("mouseenter", () => {
      tooltip.textContent = t.note;
      tooltip.style.opacity = 1;
    });

    group.addEventListener("mousemove", e => {
      tooltip.style.left = e.clientX + 15 + "px";
      tooltip.style.top = e.clientY + 15 + "px";
    });

    group.addEventListener("mouseleave", () => {
      tooltip.style.opacity = 0;
    });

    svg.appendChild(group);
  });

  resizeWall(xSpacing, ySpacing);
}

// --- RESIZE ---
function resizeWall(xSpacing, ySpacing) {
  const rows = Math.ceil(tallies.length / itemsPerRow);
  const width = startX + itemsPerRow * xSpacing + 80;
  const height = startY + rows * ySpacing;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.width = width + "px";
  svg.style.height = height + "px";
}

// --- ZOOM HANDLER ---
svg.addEventListener("wheel", e => {
  e.preventDefault();

  const zoomSpeed = 0.1;
  zoomScale += e.deltaY < 0 ? zoomSpeed : -zoomSpeed;

  zoomScale = Math.min(Math.max(zoomScale, 0.6), 2.5);

  drawWall();
}, { passive: false });

// --- INIT ---
drawWall();
