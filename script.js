const svg = document.getElementById("wall");
const tooltip = document.getElementById("tooltip");

// 1. DATE SETTINGS
const gMomBirth = new Date("1966-08-12"); 
const dadBirth = new Date(gMomBirth);
dadBirth.setFullYear(dadBirth.getFullYear() + 18); 

const myBirth = new Date(dadBirth);
myBirth.setFullYear(myBirth.getFullYear() + 20); 

const today = new Date();
const msInDay = 24 * 60 * 60 * 1000;
const totalDays = Math.floor((today - gMomBirth) / msInDay);

// 2. TIGHTER GRID SETTINGS
const itemsPerRow = 65; 
const xSpacing = 28;    // Reduced to pull them closer horizontally
const ySpacing = 60;    // Reduced to pull them closer vertically
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
        "x": 60 + (col * xSpacing),
        "y": 240 + (row * ySpacing), // 4-row gap at top
        "rotation": Math.floor(Math.random() * 11) - 5,
        "strokeCount": strokes,
        "note": `${era}'s Era — Day ${i} (${currentDay.toDateString()})`
    });
}

// 4. DRAW FUNCTION
function drawWall(data) {
    data.forEach(t => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        for (let s = 0; s < t.strokeCount; s++) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const xOffset = s * 8; // Tighter offset for strokes
            
            // Standard tilde curve path
            const d = `M${t.x + xOffset},${t.y} 
                       c4,-8 8,0 0,16 
                       c-8,16 -4,24 0,16`;

            path.setAttribute("d", d);
            path.classList.add("tally");
            group.appendChild(path);
        }

        group.setAttribute("transform", `rotate(${t.rotation}, ${t.x}, ${t.y})`);

        group.addEventListener("mouseenter", () => {
            tooltip.textContent = t.note;
            tooltip.style.opacity = 1;
        });
        group.addEventListener("mousemove", e => {
            tooltip.style.left = e.clientX + 15 + "px";
            tooltip.style.top = e.clientY + 15 + "px";
        });
        group.addEventListener("mouseleave", () => tooltip.style.opacity = 0);

        svg.appendChild(group);
    });
}

// 5. SIZE LOGIC
function resizeWall() {
    if (tallies.length === 0) return;
    const lastTally = tallies[tallies.length - 1];
    const totalHeight = lastTally.y + 100;
    const totalWidth = 60 + (itemsPerRow * xSpacing) + 100; 
    
    svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
    svg.style.height = totalHeight + "px";
    svg.style.width = totalWidth + "px";
}

drawWall(tallies);
resizeWall();
window.addEventListener("resize", resizeWall);
