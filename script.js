const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

const data = {
    "people": [
        { "name": "Grandmother", "dob": "1938-02-01", "colors": ["#4a5d4d"] }, // Muted Forest
        { "name": "Father", "dob": "1969-05-25", "colors": ["#465a8a"] },      // Slate Blue
        { "name": "Mother", "dob": "1980-01-29", "colors": ["#a65d4a"] },      // Terracotta
        { "name": "Aunt", "dob": "1985-02-07", "colors": ["#7a5a8a"] },        // Muted Plum
        { "name": "Samip", "dob": "2004-08-07", "colors": ["#4a8a9a"] },       // Muted Teal
        { "name": "Kabir", "dob": "2005-04-05", "colors": ["#8a7a4a"] },       // Dark Mustard
        { "name": "Sangram", "dob": "2008-05-07", "colors": ["#a64a6a"] }      // Dusty Rose
    ]
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scale = 1.0;
let offsetX = 50;
let offsetY = 50;
let tallies = [];

init(data.people);

function init(people) {
    people.sort((a, b) => new Date(a.dob) - new Date(b.dob));
    const startDate = new Date(people[0].dob);
    const today = new Date();
    const msDay = 86400000;
    const totalDays = Math.floor((today - startDate) / msDay);

    // FLOW SETTINGS
    const wrapWidth = window.innerWidth - 100; // Margin
    const xSpacing = 45; // Space between daily groups
    const ySpacing = 80; // Space between lines
    const stripeGap = 4; // Tight overlap like the image

    tallies = [];
    let currentX = 0;
    let currentY = 0;

    for (let i = 0; i <= totalDays; i++) {
        const date = new Date(startDate.getTime() + i * msDay);
        const activePeople = people.filter(p => new Date(p.dob) <= date);

        // If we hit the edge of the paper, go to next line
        if (currentX > wrapWidth) {
            currentX = 0;
            currentY += ySpacing;
        }

        tallies.push({
            x: currentX,
            y: currentY,
            date: date,
            people: activePeople
        });

        currentX += xSpacing;
    }
    draw();
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

    ctx.lineCap = "round";
    ctx.lineWidth = 3; 

    tallies.forEach(t => {
        // Simple culling
        const sy = t.y * scale + offsetY;
        if (sy < -100 || sy > canvas.height + 100) return;

        t.people.forEach((p, i) => {
            ctx.strokeStyle = p.colors[0];
            const x = t.x + (i * 4); // The tighter overlap
            
            ctx.beginPath();
            ctx.moveTo(x, t.y);
            // Slight consistent curve for that "hand-inked" look
            ctx.bezierCurveTo(x + 2, t.y + 15, x - 2, t.y + 30, x, t.y + 45);
            ctx.stroke();
        });
    });
}

// Interactivity
window.addEventListener("wheel", e => {
    e.preventDefault();
    if (e.ctrlKey) {
        const zoom = e.deltaY < 0 ? 1.1 : 0.9;
        scale = Math.min(Math.max(scale * zoom, 0.1), 3);
    } else {
        offsetY -= e.deltaY;
        offsetX -= e.deltaX;
    }
    draw();
}, { passive: false });

// Hover Tooltip
window.addEventListener("mousemove", e => {
    const x = (e.clientX - offsetX) / scale;
    const y = (e.clientY - offsetY) / scale;
    let found = false;

    for (const t of tallies) {
        if (x > t.x && x < t.x + 40 && y > t.y && y < t.y + 50) {
            tooltip.style.left = e.clientX + 15 + "px";
            tooltip.style.top = e.clientY + 15 + "px";
            tooltip.innerHTML = `<strong>${t.date.toDateString()}</strong><br>${t.people.length} People`;
            tooltip.style.opacity = 1;
            found = true;
            break;
        }
    }
    if (!found) tooltip.style.opacity = 0;
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(data.people); // Re-calculate flow on resize
});
