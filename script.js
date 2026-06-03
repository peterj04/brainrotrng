// Brainrots RNG - 3D First Person - Version 0.1.2
console.log("🚀 Starting Brainrots 3D...");

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
    scene.background = new THREE.Color(0x0a1a2a);
    scene.fog = new THREE.Fog(0x0a1a2a, 10, 90);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 12);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffddaa, 1);
    sun.position.set(20, 30, 10);
    scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshLambertMaterial({ color: 0x1a3a1a })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Spawn blocks
    for (let i = 0; i < 18; i++) {
        spawnLuckyBlock();
    }

    // Event Listeners
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
        new THREE.BoxGeometry(1.6, 1.6, 1.6),
        new THREE.MeshLambertMaterial({ color: 0xff3366, emissive: 0x440011 })
    );
    
    block.position.set(
        (Math.random() - 0.5) * 45,
        0.8,
        (Math.random() - 0.5) * 45
    );
    
    block.userData = { is
