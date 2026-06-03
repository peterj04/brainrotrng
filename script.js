// Brainrots RNG - Version 0.1
let gems = 0;
let brainrots = 0;
let pickaxeLevel = 1;
let pickaxePower = 1;

const rarities = [
    { name: "Common", color: "#aaaaaa", chance: 45, gems: 8 },
    { name: "Uncommon", color: "#00ff88", chance: 30, gems: 25 },
    { name: "Rare", color: "#4488ff", chance: 15, gems: 60 },
    { name: "Epic", color: "#bb44ff", chance: 7, gems: 180 },
    { name: "Legendary", color: "#ffdd00", chance: 2.5, gems: 550 },
    { name: "Mythical", color: "#ff3366", chance: 0.5, gems: 2200 }
];

let collection = {};

// Load saved data
function loadGame() {
    const saved = localStorage.getItem("brainrotsSave");
    if (saved) {
        const data = JSON.parse(saved);
        gems = data.gems || 0;
        brainrots = data.brainrots || 0;
        pickaxeLevel = data.pickaxeLevel || 1;
        collection = data.collection || {};
    }
    updateUI();
}

// Save game
function saveGame() {
    const data = {
        gems: gems,
        brainrots: brainrots,
        pickaxeLevel: pickaxeLevel,
        collection: collection
    };
    localStorage.setItem("brainrotsSave", JSON.stringify(data));
}

// Update display
function updateUI() {
    document.getElementById("gems").textContent = Math.floor(gems);
    document.getElementById("brainrots").textContent = brainrots;
}

// Get random rarity
function getRandomRarity() {
    let roll = Math.random() * 100;
    let current = 0;
    
    for (let rarity of rarities) {
        current += rarity.chance;
        if (roll <= current) return rarity;
    }
    return rarities[0];
}

// Break a block
function breakBlock(blockElement) {
    const rarity = getRandomRarity();
    
    gems += rarity.gems;
    brainrots++;
    
    // Add to collection
    if (!collection[rarity.name]) collection[rarity.name] = 0;
    collection[rarity.name]++;
    
    // Visual feedback
    blockElement.style.transition = "all 0.3s";
    blockElement.style.transform = "scale(0.1)";
    blockElement.style.opacity = "0";
    
    setTimeout(() => {
        blockElement.remove();
        updateUI();
        saveGame();
    }, 300);
    
    // Create floating text
    const floating = document.createElement("div");
    floating.textContent = `+${rarity.gems} Gems`;
    floating.style.position = "absolute";
    floating.style.color = rarity.color;
    floating.style.fontWeight = "bold";
    floating.style.pointerEvents = "none";
    document.body.appendChild(floating);
    
    setTimeout(() => floating.remove(), 1500);
}

// Spawn a new lucky block
function spawnBlock() {
    const container = document.getElementById("block-container");
    
    const block = document.createElement("div");
    block.className = "block";
    block.textContent = "🧠";
    
    block.addEventListener("click", () => breakBlock(block));
    
    container.appendChild(block);
}

// Upgrade pickaxe
function buyUpgrade() {
    const cost = pickaxeLevel * 120;
    
    if (gems >= cost) {
        gems -= cost;
        pickaxeLevel++;
        updateUI();
        saveGame();
        renderUpgrades();
        alert(`Pickaxe upgraded to level ${pickaxeLevel}!`);
    } else {
        alert("Not enough gems!");
    }
}

// Render upgrades
function renderUpgrades() {
    const container = document.getElementById("upgrades");
    container.innerHTML = `
        <button class="btn" onclick="buyUpgrade()">
            Upgrade Pickaxe (Level ${pickaxeLevel})<br>
            Cost: ${Math.floor(pickaxeLevel * 120)} Gems
        </button>
    `;
}

// Initialize
loadGame();
renderUpgrades();

// Spawn some blocks initially
for (let i = 0; i < 6; i++) {
    setTimeout(spawnBlock, i * 300);
}

// Spawn button
document.getElementById("spawn-block").addEventListener("click", spawnBlock);

// Auto save every 30 seconds
setInterval(saveGame, 30000);
