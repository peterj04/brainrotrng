// Brainrots RNG - 3D First Person - Version 0.1.3
console.log("🚀 Brainrots 3D Starting...");

let scene, camera, renderer;
let move = { forward: false, backward: false, left: false, right: false };
let gems = 0;
let brainrots = 0;

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
    scene.background = new THREE.Color(0x88aaff);        // Bright sky blue
    scene.fog = new THREE.Fog(0x88aaff, 30, 120);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 3, 15);   // Pulled camera back

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Stronger lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    const sun = new THREE.DirectionalLight(0xffffff, 1.3);
    sun.position.set(30, 50, 20);
    scene.add(sun);

    // Ground - bright green
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(120, 120),
        new THREE.MeshLambertMaterial({ color: 0x44aa44 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Spawn many visible blocks
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
        new THREE.MeshLambertMaterial({ 
            color: 0xff2255,
            emissive: 0x550022 
        })
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

// Movement & Controls (same as before)
function onKeyDown(e) { /* ... same as previous */ 
    switch(e.code) {
        case 'KeyW': move.forward = true; break;
        case 'KeyS': move.backward = true; break;
        case 'KeyA': move.left = true; break;
        case 'KeyD': move.right = true; break;
    }
}

function onKeyUp(e) {
    switch(e.code) {
        case 'KeyW': move.forward = false; break;
        case 'KeyS': move.backward = false; break;
        case 'KeyA': move.left = false; break;
        case 'KeyD': move.right = false; break;
    }
}

function onMouseMove(e) {
    if (document.pointerLockElement) {
        camera.rotation.y -= e.movementX * 0.002;
        camera.rotation.x -= e.movementY * 0.002;
        camera.rotation.x = Math.max(-1.4, Math.min(1.4, camera.rotation.x));
    }
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const speed = 0.25;
    if (move.forward) camera.translateZ(-speed);
    if (move.backward) camera.translateZ(speed);
    if (move.left) camera.translateX(-speed);
    if (move.right) camera.translateX(speed);

    renderer.render(scene, camera);
}

init();
