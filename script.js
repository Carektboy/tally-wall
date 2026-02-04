const canvas = document.getElementById("tallyCanvas");
const ctx = canvas.getContext("2d", { alpha: false }); // Optimization: no alpha channel for main background
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

// Optimization: Pre-render 1 tally mark per person to an offscreen canvas
function preRenderMarks() {
    data.people.forEach(p => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 20; 
        offCanvas.height = 60;
        const oCtx = offCanvas.getContext('2d');
        
        oCtx.strokeStyle = p.color;
        oCtx.lineWidth = 4;
        oCtx.lineCap = "round";
        oCtx.beginPath();
        oCtx.moveTo(5, 5);
        oCtx.bezierCurveTo(10, 20, 0, 40, 5, 55); // Organic S-curve
        oCtx.stroke();
        
        cache.set(p.name, offCanvas);
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

    const wrapWidth = window.innerWidth - 100;
    let curX = 0, curY = 0;

    tallies = [];
    for (let i = 0; i <= totalDays; i++) {
        const date = new Date(startDate.getTime() + i * 86400000);
        const alive = people.filter(p => new Date(p.dob) <= date);

        if (curX > wrapWidth) { curX = 0; curY += 80; }

        tallies.push({ x: curX, y: curY, date: date.toDateString(), people: alive.map(p => p.name) });
        curX += 45;
    }
    requestAnimationFrame(draw);
}

function draw() {
    ctx.fillStyle = "#fdfaf6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Viewport Culling: Only draw what is visible on screen
    const vTop = -offsetY / scale;
    const vBottom = (canvas.height - offsetY) / scale;

    for (let i = 0; i < tallies.length; i++) {
        const t = tallies[i];
        if (t.y < vTop - 100 || t.y > vBottom + 100) continue;

        for (let j = 0; j < t.people.length; j++) {
            const markImage = cache.get(t.people[j]);
            // DrawImage is significantly faster than path-drawing 30k times
            ctx.drawImage(markImage, t.x + (j * 5), t.y);
        }
    }
    ctx.restore();
}

// Optimized Interaction
window.addEventListener("wheel", e => {
    e.preventDefault();
    if (e.ctrlKey) {
        const zoom = e.deltaY < 0 ? 1.05 : 0.95;
        scale *= zoom;
    } else {
        offsetX -= e.deltaX;
        offsetY -= e.deltaY;
    }
    requestAnimationFrame(draw);
}, { passive: false });

window.addEventListener("mousemove", e => {
    const x = (e.clientX - offsetX) / scale;
    const y = (e.clientY - offsetY) / scale;
    
    // Check collision with roughly the current area
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

init();
