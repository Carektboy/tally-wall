const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const tooltip = document.getElementById("tooltip");

const data = {
    "people": [
        { "name": "Grandmother", "dob": "1938-02-01", "color": "#2d5a27" },
        { "name": "Father", "dob": "1969-05-25", "color": "#1e3a8a" },
        { "name": "Mother", "dob": "1980-01-29", "color": "#9a3412" },
        { "name": "Aunt", "dob": "1985-02-07", "color": "#5b21b6" },
        { "name": "Samip", "dob": "2004-08-07", "color": "#0369a1" },
        { "name": "Kabir", "dob": "2005-04-05", "color": "#854d0e" },
        { "name": "Sangram", "dob": "2008-05-07", "color": "#9d174d" }
    ]
};

let scale = 0.8, offsetX = 50, offsetY = 50;
let tallies = [];
const cache = new Map();

// High Performance: Pre-draw each person's stroke once
function preRenderMarks() {
    data.people.forEach(p => {
        const off = document.createElement('canvas');
        off.width = 20; off.height = 60;
        const oCtx = off.getContext('2d');
        oCtx.strokeStyle = p.color;
        oCtx.lineWidth = 4;
        oCtx.lineCap = "round";
        oCtx.beginPath();
        oCtx.moveTo(5, 5);
        oCtx.bezierCurveTo(12, 20, -2, 40, 5, 55); // Organic S-Curve
        oCtx.stroke();
        cache.set(p.name, off);
    });
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    preRenderMarks();

    const people = [...data.people].sort((a, b) => new Date(a.dob) - new Date(b.dob));
    const startDate = new Date(people[0].dob);
    const today = new Date();
    const totalDays = Math.floor((today - startDate) / 86400000);

    const wrapWidth = window.innerWidth - 150;
    let curX = 0, curY = 0;

    tallies = [];
    for (let i = 0; i <= totalDays; i++) {
        const date = new Date(startDate.getTime() + i * 86400000);
        const alive = people.filter(p => new Date(p.dob) <= date);

        if (curX > wrapWidth) { curX = 0; curY += 100; }

        tallies.push({ 
            x: curX, 
            y: curY, 
            date: date.toDateString(), 
            people: alive.map(p => p.name) 
        });
        curX += 45; // Spacing between days
    }
    requestAnimationFrame(draw);
}

function draw() {
    ctx.fillStyle = "#fdfaf6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Viewport Culling: Only draw visible rows
    const vTop = -offsetY / scale;
    const vBottom = (canvas.height - offsetY) / scale;

    tallies.forEach(t => {
        if (t.y < vTop - 100 || t.y > vBottom + 100) return;

        t.people.forEach((name, j) => {
            const img = cache.get(name);
            ctx.drawImage(img, t.x + (j * 4), t.y); // Overlap logic (4px)
        });
    });
    ctx.restore();
}

// FIXED: Zoom-to-Cursor Logic
window.addEventListener("wheel", e => {
    e.preventDefault();
    const mouseX = (e.clientX - offsetX) / scale;
    const mouseY = (e.clientY - offsetY) / scale;

    if (e.ctrlKey || e.metaKey) {
        const factor = Math.pow(1.1, -Math.sign(e.deltaY));
        const newScale = Math.min(Math.max(scale * factor, 0.05), 4);
        
        offsetX = e.clientX - mouseX * newScale;
        offsetY = e.clientY - mouseY * newScale;
        scale = newScale;
    } else {
        offsetX -= e.deltaX;
        offsetY -= e.deltaY;
    }
    requestAnimationFrame(draw);
}, { passive: false });

// Tooltip Interaction
window.addEventListener("mousemove", e => {
    const x = (e.clientX - offsetX) / scale;
    const y = (e.clientY - offsetY) / scale;
    
    const t = tallies.find(t => x > t.x && x < t.x + 40 && y > t.y && y < t.y + 60);
    if (t) {
        tooltip.style.opacity = 1;
        tooltip.style.left = e.clientX + 15 + "px";
        tooltip.style.top = e.clientY + 15 + "px";
        tooltip.innerHTML = `<strong>${t.date}</strong><br>${t.people.join(", ")}`;
    } else {
        tooltip.style.opacity = 0;
    }
});

// Resizing
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(); 
});

init();
