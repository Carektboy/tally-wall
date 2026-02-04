const svg = document.getElementById("wall");
const tooltip = document.getElementById("tooltip");

// 1. DATES & MILESTONES
const gMomBirth = new Date("1950-01-01"); // Change to actual date
const dadBirth = new Date(gMomBirth);
dadBirth.setFullYear(dadBirth.getFullYear() + 18); // 18 years later

const myBirth = new Date(dadBirth);
myBirth.setFullYear(myBirth.getFullYear() + 20); // 20 years later

const today = new Date();

// 2. GRID CONFIG
const itemsPerRow = 60;
const xSpacing = 28; 
const ySpacing = 70; 
const tallies = [];

// 3. GENERATION LOOP
const msInDay = 24 * 60 * 60 * 1000;
const totalDays = Math.floor((today - gMomBirth) / msInDay);

for (let i = 1; i <= totalDays; i++) {
    const row = Math.floor((i - 1) / itemsPerRow);
    const col = (i - 1) % itemsPerRow;

    const currentDay = new Date(gMomBirth.getTime() + (i * msInDay));
    
    // Determine the Symbol Type based on the Person
    let type = "Grandmother";
    let strokeCount = 1;

    if (currentDay >= dadBirth && currentDay < myBirth) {
        type = "Father";
        strokeCount = 2; // (||)
    } else if (currentDay >= myBirth) {
        type = "Me";
        strokeCount = 3; // (|||)
    }

    tallies.push({
        "id": i,
        "x": 60 + (col * xSpacing),
        "y": 80 + (row * ySpacing),
        "rotation": Math.floor(Math.random() * 11) - 5,
        "strokeCount": strokeCount,
        "note": `${type}'s Era — Day ${i} (${currentDay.toDateString()})`
    });
}

// 4. DRAWING FUNCTION
function drawTallies(data) {
    data.forEach(t => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        for (let s = 0; s < t.strokeCount; s++) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const xOffset = s * 7; 
            
            // Curved path mimicking your uploaded tilde
            const d = `M${t.x + xOffset},${t.y} 
                       c4,-6 8,0 0,12 
                       c-8,12 -4,18 0,12`;

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

function resizeSVG() {
    const lastTally = tallies[tallies.length - 1];
    const totalHeight = lastTally.y + 120;
    const totalWidth = 60 + (itemsPerRow * xSpacing) + 60;
    svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
    svg.style.height = totalHeight + "px";
}

drawTallies(tallies);
resizeSVG();
window.addEventListener("resize", resizeSVG);
