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
const xSpacing = 32;
const ySpacing = 70;

const startX = 60;
const startY = 40;

const tallies = [];

// --- DATA GENERATION ---
for (let i = 0; i < totalDays; i++) {
  const row = Math.floor(i / itemsPerRow);
  const col = i % itemsPerRow;
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
    x: startX + col * xSpacing,
    y: startY + row * ySpacing,
    rotation: Math.random() * 10 - 5,
    strokeCount: strokes,
    note: `${era}: ${currentDay.toDateString()}`
  });
}

// --- DRAW ---
function drawWall(data) {
  data.forEach(t => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    for (let s = 0; s < t.strokeCount; s++) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const xOffset = s * 8;

      const d = `
        M ${t.x + xOffset} ${t.y}
        c 4 -8 8 0 0 16
        c -8 16 -4 24 0 16
      `;

      path.setAttribute("d", d);
      path.classList.add("tally");
      group.appendChild(path);
    }

    group.setAttribute(
      "transform",
      `rotate(${t.rotation}, ${t.x}, ${t.y})`
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
}

// --- RESIZE ---
function resizeWall() {
  if (!tallies.length) return;

  const last = tallies[tallies.length - 1];
  const width = startX + itemsPerRow * xSpacing + 80;
  const height = last.y + ySpacing;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.width = width + "px";
  svg.style.height = height + "px";
}

drawWall(tallies);
resizeWall();
window.addEventListener("resize", resizeWall);
