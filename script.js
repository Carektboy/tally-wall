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

// CONFIGURATION
let scale = 0.8;
let offsetX = 80, offsetY = 80;
let tallies = [];
const cache = new Map();
const dpr = window.devicePixelRatio || 1; // Critical for High Quality

function preRenderMarks() {
    data.people.forEach(p => {
        const off = document.createElement('canvas');
        // Pre-render at high density
        off.width = 30 * dpr; 
        off.height = 80 * dpr;
        const oCtx = off.getContext('2d');
        oCtx.scale(dpr, dpr); 

        oCtx.strokeStyle = p.color;
        oCtx.lineWidth = 2.2; // Thin, professional line
        oCtx.lineCap = "round";
        oCtx.beginPath();
        oCtx.moveTo(10, 5);
        oCtx.bezierCurveTo(13, 25, 7, 45, 10, 75); // Subtle hand-inked curve
        oCtx.stroke();
        cache.set(p.name, off);
    });
}

function init() {
    // Sharpness setup
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    
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

        // Grid wrap
        if (curX > wrapWidth) { 
            curX = 0; 
            curY += 110; 
        }

        tallies.push({ 
            x: curX, 
            y: curY, 
            date: date.toDateString(), 
            people: alive.map(p => p.name) 
        });

        // SPACE BETWEEN DAYS (Overlap groups)
        curX += 24; 
    }
    draw();
}

function draw() {
    // Reset transform to DPR for crystal clear drawing
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fdfaf6";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Culling: Only draw rows visible on screen
    const vTop = -offsetY / scale;
    const vBottom = (window.innerHeight - offsetY) / scale;

    tallies.forEach(t => {
        if (t.y < vTop - 150 || t.y > vBottom + 150) return;
        
        t.people.forEach((name, j) => {
            const img = cache.get(name);
            // Overlap within day (j * 4)
            if (img) ctx.drawImage(img, t.x + (j * 4), t.y, 30, 80);
        });
    });
    ctx.restore();
}

// Fixed High-Precision Interaction
window.addEventListener("wheel", e => {
    e.preventDefault();
    const mouseX = (e.clientX - offsetX) / scale;
    const mouseY = (e.clientY - offsetY) / scale;

    if (e.ctrlKey || e.metaKey) {
        // Smooth Zoom
        const zoomFactor = Math.pow(1.1, -Math.sign(e.deltaY));
        const newScale = Math.min(Math.max(scale * zoomFactor, 0.05), 4);
        
        offsetX = e.clientX - mouseX * newScale;
        offsetY = e.clientY - mouseY * newScale;
        scale = newScale;
    } else {
        // Panning
        offsetX -= e.deltaX;
        offsetY -= e.deltaY;
    }
    requestAnimationFrame(draw);
}, { passive: false });

window.addEventListener("mousemove", e => {
    const x = (e.clientX - offsetX) / scale;
    const y = (e.clientY - offsetY) / scale;
    
    // Find the date group under mouse
    const t = tallies.find(t => x > t.x && x < t.x + 35 && y > t.y && y < t.y + 80);
    
    if (t) {
        tooltip.style.opacity = 1;
        tooltip.style.left = e.clientX + 15 + "px";
        tooltip.style.top = e.clientY + 15 + "px";
        tooltip.innerHTML = `<strong>${t.date}</strong><br>${t.people.length} People Present`;
    } else {
        tooltip.style.opacity = 0;
    }
});

// Auto-Quality adjustment on window resize
window.addEventListener("resize", () => {
    init();
});

// Initial Load
init();
