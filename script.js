// Brainrots RNG - 3D First Person - Version 0.1.4
console.log("🚀 Brainrots 3D - Improved Controls");

let scene, camera, renderer;
let move = { forward: false, backward: false, left: false, right: false, sprint: false };
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let gems = 0;
let brainrots = 0;
let canJump = true;

const rarities = [
    { name: "Common", color: 0xaaaaaa, chance: 45, gems: 10 },
    { name: "Uncommon", color: 0x00ff88, chance: 30, gems: 30 },
    { name: "Rare", color: 0x4488ff, chance: 15, gems: 80 },
    { name: "Epic", color: 0xbb44ff, chance: 7, gems: 220 },
    { name: "Legendary", color: 0xffdd00, chance: 2.5, gems: 650 },
    { name: "Mythical", color: 0xff3366, chance: 0.5, gems: 2500 }
];

let blocks = [];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x88aaff);
    scene.fog = new THREE.Fog(0x88aaff, 30, 120);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 1.8, 15);   // Eye height

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1.3);
    sun.position.set(30, 50, 20);
    scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(120, 120),
        new THREE.MeshLambertMaterial({ color: 0x44aa44 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Spawn blocks
    for (let i = 0; i < 25; i++) {
        spawnLuckyBlock();
    }

    // Controls
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', onClick);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    updateUI();
    animate();
}

function spawnLuckyBlock() {
    const block = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshLambertMaterial({ color: 0xff3366, emissive: 0x550022 })
    );
    
    block.position.set(
        (Math.random() - 0.5) * 60,
        1,
        (Math.random() - 0.5) * 60
    );
    
    block.userData = { isLuckyBlock: true };
    scene.add(block);
    blocks.push(block);
}

function onClick() {
    if (!document.pointerLockElement) {
        renderer.domElement.requestPointerLock();
        return;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    
    const hits = raycaster.intersectObjects(blocks);
    if (hits.length > 0) {
        mineBlock(hits[0].object);
    }
}

function mineBlock(block) {
    const rarity = getRandomRarity();
    gems += rarity.gems;
    brainrots++;

    scene.remove(block);
    blocks = blocks.filter(b => b !== block);

    updateUI();
    setTimeout(spawnLuckyBlock, 500);
}

function getRandomRarity() {
    let roll = Math.random() * 100;
    let current = 0;
    for (let r of rarities) {
        current += r.chance;
        if (roll <= current) return r;
    }
    return rarities[0];
}

function updateUI() {
    document.getElementById("gems").textContent = Math.floor(gems);
    document.getElementById("brainrots").textContent = brainrots;
}

// ==================== CONTROLS ====================
function onKeyDown(e) {
    switch(e.code) {
        case 'KeyW': move.forward = true; break;
        case 'KeyS': move.backward = true; break;
        case 'KeyA': move.left = true; break;
        case 'KeyD': move.right = true; break;
        case 'ShiftLeft':
        case 'ShiftRight': move.sprint = true; break;
        case 'Space':
            if (canJump) {
                velocity.y = 12;
                canJump = false;
            }
            break;
    }
}

function onKeyUp(e) {
    switch(e.code) {
        case 'KeyW': move.forward = false; break;
        case 'KeyS': move.backward = false; break;
        case 'KeyA': move.left = false; break;
        case 'KeyD': move.right = false; break;
        case 'ShiftLeft':
        case 'ShiftRight': move.sprint = false; break;
    }
}

function onMouseMove(e) {
    if (document.pointerLockElement) {
        camera.rotation.y -= e.movementX * 0.002;
