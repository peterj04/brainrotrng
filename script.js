// Brainrots RNG - 3D First Person - Version 0.1
let scene, camera, renderer;
let move = { forward: false, backward: false, left: false, right: false };
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let gems = 0;
let brainrots = 0;
let pickaxePower = 1;

let blocks = [];

// Rarities
const rarities = [
    { name: "Common", color: 0xaaaaaa, chance: 45, gems: 10 },
    { name: "Uncommon", color: 0x00ff88, chance: 30, gems: 30 },
    { name: "Rare", color: 0x4488ff, chance: 15, gems: 80 },
    { name: "Epic", color: 0xbb44ff, chance: 7, gems: 220 },
    { name: "Legendary", color: 0xffdd00, chance: 2.5, gems: 650 },
    { name: "Mythical", color: 0xff3366, chance: 0.5, gems: 2500 }
];

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x112233);
    scene.fog = new THREE.Fog(0x112233, 10, 100);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.8, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffeecc, 1);
    sun.position.set(10, 20, 10);
    scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshLambertMaterial({ color: 0x334422 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Spawn initial blocks
    for (let i = 0; i < 12; i++) {
        spawnLuckyBlock();
    }

    // Controls
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', onClick);
    document.addEventListener('mousemove', onMouseMove);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Fullscreen
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'f') {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        }
    });

    updateUI();
}

function spawnLuckyBlock() {
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const material = new THREE.MeshLambertMaterial({ 
        color: 0xff5555,
        emissive: 0x550000
    });
    
    const block = new THREE.Mesh(geometry, material);
    
    block.position.set(
        Math.random() * 30 - 15,
        0.6,
        Math.random() * 30 - 15
    );
    
    block.userData = { isLuckyBlock: true };
    scene.add(block);
    blocks.push(block);
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

function onClick(e) {
    if (!document.pointerLockElement) {
        renderer.domElement.requestPointerLock();
        return;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    
    const intersects = raycaster.intersectObjects(blocks);
    
    if (intersects.length > 0) {
        const block = intersects[0].object;
        
        if (block.userData.isLuckyBlock) {
            const rarity = getRandomRarity();
            
            gems += rarity.gems;
            brainrots++;
            
            // Visual effect
            scene.remove(block);
            blocks = blocks.filter(b => b !== block);
            
            // Spawn floating text (simple alert for now)
            console.log(`%c+${rarity.gems} Gems (${rarity.name})`, `color:${rarity.color.toString(16)}`);
            
            updateUI();
            
            // Respawn a new block
            setTimeout(spawnLuckyBlock, 800);
        }
    }
}

function updateUI() {
    document.getElementById("gems").textContent = Math.floor(gems);
    document.getElementById("brainrots").textContent = brainrots;
}

// Basic movement
function onKeyDown(e) {
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
        camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
    }
}

function animate() {
    requestAnimationFrame(animate);

    const speed = 0.15;
    
    direction.z = Number(move.forward) - Number(move.backward);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();

    if (move.forward || move.backward) velocity.z = direction.z * speed;
    else velocity.z *= 0.8;
    
    if (move.left || move.right) velocity.x = direction.x * speed;
    else velocity.x *= 0.8;

    camera.translateX(velocity.x);
    camera.translateZ(velocity.z);

    renderer.render(scene, camera);
}
