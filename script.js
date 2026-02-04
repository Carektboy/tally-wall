const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

const data = {
    "people": [
        { "name": "Grandmother", "dob": "1938-02-01", "colors": ["#e66b5b"] }, // Reddish
        { "name": "Father", "dob": "1969-05-25", "colors": ["#6b9ae6"] },      // Bluish
        { "name": "Mother", "dob": "1980-01-29", "colors": ["#f0c05a"] },      // Yellowish
        { "name": "Aunt", "dob": "1985-02-07", "colors": ["#a178d1"] },        // Purple
        { "name": "Samip", "dob": "2004-08-07", "colors": ["#5baec4"] },       // Teal
        { "name": "Kabir", "dob": "2005-04-05", "colors": ["#c28d5a"] },       // Brown
        { "name": "Sangram", "dob": "2008-05-07", "colors": ["#c45b8e"] }      // Pink
    ]
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scale = 1.0; 
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let tallies = [];

init(data.people);

function init(people) {
    people.sort((a, b) => new Date(a.dob) - new Date(b.dob));
    const startDate = new Date(people[0].getFullYear(), 0, 1); // Start at Jan 1st of birth year
    const today = new Date();
    
    // For this specific look, we show ONE tally per year as per the reference image
    const startYear = startDate.getFullYear();
    const endYear = today.getFullYear();

    const perRow = 10; // 10 years per row like the image
    const xGap = 120; 
    const yGap = 150;

    tallies = [];

    for (let year = startYear; year <= endYear; year++) {
        const index = year - startYear;
        const row = Math.floor(index / perRow);
        const col = index % perRow;
        
        // Filter people alive during this year
        const activePeople = people.filter(p => new Date(p.dob).getFullYear() <= year);

        tallies.push({
            x: col * xGap + 100,
            y: row * yGap + 100,
            year: year,
            people: activePeople
        });
    }
    
    draw();
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    
    ctx.lineCap = "round";
    ctx.lineWidth = 4; // Thinner, cleaner lines

    tallies.forEach(t => {
        // Culling for performance
        const screenX = t.x * scale + offsetX;
        const screenY = t.y * scale + offsetY;
        if (screenX < -200 || screenX > canvas.width + 200 || screenY < -200 || screenY > canvas.height + 200) return;

        // Draw Year Label
        ctx.fillStyle = "#999";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(t.year, t.x + (t.people.length * 4), t.y - 20);

        // Draw Clean Tallies
        t.people.forEach((p, i) => {
            ctx.strokeStyle = p.colors[0];
            const xPos = t.x + (i * 10); // Slightly more space between stripes
            
            ctx.beginPath();
            ctx.moveTo(xPos, t.y);
            // Uniform slight curve
            ctx.quadraticCurveTo(xPos + 2, t.y + 20, xPos, t.y + 50);
            ctx.stroke();
        });
    });
}

// Interactivity (Same as before)
canvas.addEventListener("wheel", e => {
    e.preventDefault();
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const mouseX = (e.clientX - offsetX) / scale;
    const mouseY = (e.clientY - offsetY) / scale;
    scale = Math.min(Math.max(scale * zoom, 0.1), 3);
    offsetX = e.clientX - mouseX * scale;
    offsetY = e.clientY - mouseY * scale;
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
        if (x > t.x - 20 && x < t.x + 80 && y > t.y - 20 && y < t.y + 60) {
            tooltip.style.left = e.clientX + 15 + "px";
            tooltip.style.top = e.clientY + 15 + "px";
            tooltip.innerHTML = `Year: ${t.year}<br>${t.people.map(p => p.name).join(", ")}`;
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
