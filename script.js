const canvas = document.getElementById("wall");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

const gMomBirth = new Date("1945-05-12"); 
const dadBirth = new Date(gMomBirth);
dadBirth.setFullYear(dadBirth.getFullYear() + 18); 
const myBirth = new Date(dadBirth);
myBirth.setFullYear(myBirth.getFullYear() + 20); 

const today = new Date();
const msInDay = 24 * 60 * 60 * 1000;
const totalDays = Math.floor((today - gMomBirth) / msInDay);

const itemsPerRow = 10; // Big for mobile
const xSpacing = 35;    
const ySpacing = 85;    
const tallies = [];

// 1. GENERATE DATA
for (let i = 1; i <= totalDays; i++) {
    const row = Math.floor((i - 1) / itemsPerRow);
    const col = (i - 1) % itemsPerRow;
    const currentDay = new Date(gMomBirth.getTime() + (i * msInDay));
    
    let era = "Grandmother";
    let strokes = 1;
    if (currentDay >= dadBirth && currentDay < myBirth) { era = "Father"; strokes = 2; }
    else if (currentDay >= myBirth) { era = "Me"; strokes = 3; }

    tallies.push({
        x: 40 + (col * xSpacing),
        y: 120 + (row * ySpacing), // 4-line gap
        rotation: (Math.random() * 20 - 10) * Math.PI / 180,
        strokes: strokes,
        note: `${era}: ${currentDay.toDateString()}`
    });
}

// 2. DRAW FUNCTION (Lightning Fast)
function draw() {
    const lastTally = tallies[tallies.length - 1];
    canvas.width = 40 + (itemsPerRow * xSpacing) + 30;
    canvas.height = lastTally.y + 100;

    ctx.fillStyle = "#f4efe8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.lineWidth = 4.5; // Thicker for visibility
    ctx.lineCap = "round";

    tallies.forEach(t => {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);
        
        for (let s = 0; s < t.strokes; s++) {
            const xOff = s * 10;
            ctx.beginPath();
            // Tilde path in Canvas
            ctx.moveTo(xOff, 0);
            ctx.bezierCurveTo(xOff + 5, -10, xOff + 10, 0, xOff, 20);
            ctx.bezierCurveTo(xOff - 10, 40, xOff - 5, 50, xOff, 40);
            ctx.stroke();
        }
        ctx.restore();
    });
}

// 3. TAP INTERACTION
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Find the closest tally
    let closest = tallies[0];
    let minDist = Infinity;
    
    tallies.forEach(t => {
        const d = Math.sqrt((clickX - t.x)**2 + (clickY - t.y)**2);
        if (d < minDist) {
            minDist = d;
            closest = t;
        }
    });

    if (minDist < 50) {
        tooltip.textContent = closest.note;
    }
});

draw();
