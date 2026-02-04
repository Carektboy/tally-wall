const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");

/* ===== ADJUST THESE ===== */
const LINE_GAP = 10;        // space between tallies
const LINE_WIDTH = 4;       // thickness of tally
const ROW_HEIGHT = 30;      // height of each person's line
const PERSON_GAP = 40;      // space between people
/* ======================= */

fetch("./data.json")
  .then(res => res.json())
  .then(drawWall)
  .catch(err => console.error("Data load error:", err));

function drawWall(data) {
  const width = window.innerWidth;
  const height =
    data.length * (ROW_HEIGHT + PERSON_GAP) + 60;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  let y = 40;

  data.forEach(person => {
    drawPersonRow(person, y);
    y += ROW_HEIGHT + PERSON_GAP;
  });
}

function drawPersonRow(person, y) {
  /* Name */
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px Arial";
  ctx.fillText(person.name, 10, y - 10);

  ctx.strokeStyle = person.color;
  ctx.lineWidth = LINE_WIDTH;

  let x = 10;

  for (let i = 1; i <= person.count; i++) {
    /* Vertical line */
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + ROW_HEIGHT);
    ctx.stroke();

    /* Every 5th tally is diagonal */
    if (i % 5 === 0) {
      ctx.beginPath();
      ctx.moveTo(x - LINE_GAP * 4, y + ROW_HEIGHT);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    x += LINE_GAP;
  }
}
