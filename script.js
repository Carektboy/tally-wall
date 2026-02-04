const svg = document.getElementById("wall");
const tooltip = document.getElementById("tooltip");

// 1. DATE SETTINGS
const gMomBirth = new Date("1945-05-12"); 
const dadBirth = new Date(gMomBirth);
dadBirth.setFullYear(dadBirth.getFullYear() + 18); 
const myBirth = new Date(dadBirth);
myBirth.setFullYear(myBirth.getFullYear() + 20); 

const today = new Date();
const msInDay = 24 * 60 * 60 * 1000;
const totalDays = Math.floor((today - gMomBirth) / msInDay);

// 2. MOBILE-FIRST GRID SETTINGS
const itemsPerRow = 15; // Small number = Big tallies
const xSpacing = 25;    // Horizontal gap
const ySpacing = 80;    // Vertical gap
const tallies = [];

// 3. GENERATION LOOP
for (let i = 1; i <= totalDays; i++) {
    const row = Math.floor((i - 1) / itemsPerRow);
    const col = (i - 1) % itemsPerRow;
    const currentDay = new Date(gMomBirth.getTime() + (i * msInDay));
    
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
        "id": i,
        "x": 30 + (col * xSpacing), // Start close to the left edge
        "y": 120 + (row * ySpacing), // Tightened top gap for mobile
        "rotation": Math.floor(Math.random() * 15) - 7, // More "hand-drawn" feel
        "strokeCount": strokes,
        "note": `${era}: ${currentDay.toDateString()}`
    });
}

// 4. DRAW FUNCTION
function drawWall(data) {
    data.forEach(t => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        for (let s = 0; s < t.strokeCount; s++) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const xOffset = s * 7; 
            
            // Scaled tilde for mobile
            const d = `M${t.x + xOffset},${t.y} 
                       c5,-10 10,0 0,20 
                       c-10,20 -5,30 0,20`;

            path.setAttribute("d", d);
            path.classList.add("tally");
            group.appendChild(path);
        }

        group.setAttribute("transform", `rotate(${t.rotation}, ${t.x}, ${t.y})`);

        // Mobile touch interaction
        group.addEventListener("touchstart", (e) => {
            tooltip.textContent = t.note;
            tooltip.style.opacity = 1;
            tooltip.style.left = "50%";
            tooltip.style.top = "10%";
            tooltip.style.transform = "translateX(-50%)";
        });

        svg.appendChild(group);
    });
}

// 5. AUTO-SIZE
function resizeWall() {
    if (tallies.length === 0) return;
    const lastTally = tallies[tallies.length - 1];
    const totalHeight = lastTally.y + 100;
    // Calculate width based on items per row
    const totalWidth = 30 + (itemsPerRow * xSpacing) + 50; 
    
    svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
    svg.style.width = "100%"; // Forces it to fit phone screen
    svg.style.height = "auto";
}

drawWall(tallies);
resizeWall();
window.addEventListener("resize", resizeWall);
