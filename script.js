const svg = document.getElementById("wall");
const tooltip = document.getElementById("tooltip");

// 1. DATE SETTINGS
const gMomBirth = new Date("1945-05-12"); // Update to Grandma's birthday
const dadBirth = new Date(gMomBirth);
dadBirth.setFullYear(dadBirth.getFullYear() + 18); 

const myBirth = new Date(dadBirth);
myBirth.setFullYear(myBirth.getFullYear() + 20); 

// Gets current date automatically so it grows every day
const today = new Date();
const msInDay = 24 * 60 * 60 * 1000;
const totalDays = Math.floor((today - gMomBirth) / msInDay);

// 2. GRID SETTINGS
const itemsPerRow = 60;
const xSpacing = 32; 
const ySpacing = 75; 
const tallies = [];

// 3. GENERATION LOOP
for (let i = 1; i <= totalDays; i++) {
    const row = Math.floor((i - 1) / itemsPerRow);
    const col = (i - 1) % itemsPerRow;
    const currentDay = new Date(gMomBirth.getTime() + (i * msInDay));
    
    let era = "Grandmother";
    let strokes = 1;
    let color = "#3498db"; // Blue for Grandmother

    if (currentDay >= dadBirth && currentDay < myBirth) {
        era = "Father";
        strokes = 2;
        color = "#2ecc71"; // Green for Father
    } else if (currentDay >= myBirth) {
        era = "Me";
        strokes = 3;
        color = "#e67e22"; // Orange for Me
    }

    tallies.push({
        "id": i,
        "x": 100 + (col * xSpacing), // 100px left margin
        "y": 40 + (row * ySpacing),  // 40px top margin
        "rotation": Math.floor(Math.random() * 11) - 5,
        "strokeCount": strokes,
        "color": color,
        "note": `${era}'s Era — Day ${i} (${currentDay.toDateString()})`
    });
}

// 4. DRAW FUNCTION
function drawWall(data) {
    data.forEach(t => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        for (let s = 0; s < t.strokeCount; s++) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const xOffset = s * 8; 
            // Tilde path data
            const d = `M${t.x + xOffset},${t.y} c4,-6 8,0 0,12 c-8,12 -4,18 0,12`; 
            path.setAttribute("d", d);
            path.style.stroke = t.color;
            path.classList.add("tally");
            group.appendChild(path);
        }
        group.setAttribute("transform", `rotate(${t.rotation}, ${t.x}, ${t.y})`);
        
        // Tooltip interaction
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

// 5. RESPONSIVE SIZE
function resizeWall() {
    if (tallies.length === 0) return;
    const lastTally = tallies[tallies.length - 1];
    const totalHeight = lastTally.y + 80; 
    const totalWidth = 100 + (itemsPerRow * xSpacing) + 180; 
    svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
    svg.style.height = totalHeight + "px";
    svg.style.width = totalWidth + "px";
}

drawWall(tallies);
resizeWall();
window.addEventListener("resize", resizeWall);
