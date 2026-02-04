const svg = document.getElementById("wall");
const tooltip = document.getElementById("tooltip");

// 1. DATE SETTINGS (Grandmother born in 1945 as an example)
const gMomBirth = new Date("1945-05-12"); 
const dadBirth = new Date(gMomBirth);
dadBirth.setFullYear(dadBirth.getFullYear() + 18); 

const myBirth = new Date(dadBirth);
myBirth.setFullYear(myBirth.getFullYear() + 20); 

const today = new Date();
const msInDay = 24 * 60 * 60 * 1000;
const totalDays = Math.floor((today - gMomBirth) / msInDay);

// 2. GRID & SIZE SETTINGS
const itemsPerRow = 45; // Fewer items makes them appear larger
const xSpacing = 50;    // More breathing room for bigger tallies
const ySpacing = 90;    // Taller rows
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
        strokes = 2; // (||)
    } else if (currentDay >= myBirth) {
        era = "Me";
        strokes = 3; // (|||)
    }

    tallies.push({
        "id": i,
        "x": 80 + (col * xSpacing),
        "y": 360 + (row * ySpacing), // Starts after a 4-line gap
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
            const xOffset = s * 14; // Wider gap between the lines of a group
            
            // Bigger tilde curve path
            const d = `M${t.x + xOffset},${t.y} 
                       c6,-12 12,0 0,24 
                       c-12,24 -6,36 0,24`;

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
    
    const totalHeight = lastTally.y + 150;
    const totalWidth = 80 + (itemsPerRow * xSpacing) + 120; 
    
    svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
    svg.style.height = totalHeight + "px";
    svg.style.width = totalWidth + "px";
}

drawWall(tallies);
resizeWall();
window.addEventListener("resize", resizeWall);
