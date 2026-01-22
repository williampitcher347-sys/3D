const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Player
camera.position.set(0, 2, 5);
let velocityY = 0;
let onGround = false;

// Controls
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Pointer lock
const lock = document.getElementById("lock");
lock.onclick = () => document.body.requestPointerLock();
document.addEventListener("pointerlockchange", () => {
  lock.style.display = document.pointerLockElement ? "none" : "block";
});

// Mouse look
document.addEventListener("mousemove", e => {
  if (document.pointerLockElement) {
    camera.rotation.y -= e.movementX * 0.002;
    camera.rotation.x -= e.movementY * 0.002;
    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
  }
});

// Platform helper
function platform(x, y, z, w = 4, h = 1, d = 4) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: 0x4444ff })
  );
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}

const platforms = [
  platform(0, 0, 0, 20, 1, 20),
  platform(5, 3, -5),
  platform(-5, 6, -10),
  platform(0, 9, -15)
];

// Game loop
function animate() {
  requestAnimationFrame(animate);

  // Movement
  const speed = 0.15;
  const dir = new THREE.Vector3();

  if (keys["KeyW"]) dir.z -= 1;
  if (keys["KeyS"]) dir.z += 1;
  if (keys["KeyA"]) dir.x -= 1;
  if (keys["KeyD"]) dir.x += 1;

  dir.normalize().applyEuler(camera.rotation);
  camera.position.add(dir.multiplyScalar(speed));

  // Gravity
  velocityY -= 0.01;
  camera.position.y += velocityY;

  onGround = false;
  platforms.forEach(p => {
    if (
      Math.abs(camera.position.x - p.position.x) < 2 &&
      Math.abs(camera.position.z - p.position.z) < 2 &&
      camera.position.y <= p.position.y + 1.5
    ) {
      camera.position.y = p.position.y + 1.5;
      velocityY = 0;
      onGround = true;
    }
  });

  if (keys["Space"] && onGround) velocityY = 0.25;

  // Kill floor
  if (camera.position.y < -10) {
    camera.position.set(0, 2, 5);
    velocityY = 0;
  }

  renderer.render(scene, camera);
}

animate();
