// ===== SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// ===== PLATFORM =====
const platform = new THREE.Mesh(
  new THREE.BoxGeometry(20, 1, 20),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
scene.add(platform);

// ===== PLAYER =====
camera.position.set(0, 2, 5);

// ===== INPUT =====
const keys = {};
addEventListener("keydown", e => keys[e.code] = true);
addEventListener("keyup", e => keys[e.code] = false);

// ===== POINTER LOCK (FIXED) =====
document.addEventListener("click", () => {
  if (!document.pointerLockElement) {
    renderer.domElement.requestPointerLock();
    console.log("Pointer lock requested");
  }
});

document.addEventListener("pointerlockchange", () => {
  console.log("Pointer lock:", document.pointerLockElement ? "ON" : "OFF");
});

// ===== MOUSE LOOK (VERY OBVIOUS) =====
let pitch = 0;
document.addEventListener("mousemove", e => {
  if (!document.pointerLockElement) return;

  camera.rotation.y -= e.movementX * 0.003;
  pitch -= e.movementY * 0.003;
  pitch = Math.max(-1.5, Math.min(1.5, pitch));
  camera.rotation.x = pitch;
});

// ===== GAME LOOP =====
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.15;

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3().crossVectors(forward, camera.up);

  if (keys.KeyW) camera.position.add(forward.multiplyScalar(speed));
  if (keys.KeyS) camera.position.add(forward.multiplyScalar(-speed));
  if (keys.KeyA) camera.position.add(right.multiplyScalar(-speed));
  if (keys.KeyD) camera.position.add(right.multiplyScalar(speed));

  renderer.render(scene, camera);
}

animate();
