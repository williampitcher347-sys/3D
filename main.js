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
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 20, 10);
scene.add(sun);

// ===== MAP =====
function box(x, y, z, w, h, d, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}

// Floor
box(0, -0.5, 0, 60, 1, 60, 0x4a6cff);

// Walls
box(0, 4, -30, 60, 8, 1, 0x888888);
box(0, 4, 30, 60, 8, 1, 0x888888);
box(-30, 4, 0, 1, 8, 60, 0x888888);
box(30, 4, 0, 1, 8, 60, 0x888888);

// Platforms (map start)
box(5, 1, -6, 4, 1, 4, 0x7777ff);
box(-5, 2, -12, 4, 1, 4, 0x7777ff);
box(5, 3, -18, 4, 1, 4, 0x7777ff);

// ===== PLAYER =====
camera.position.set(0, 2, 10);

// ===== INPUT =====
const keys = {};
addEventListener("keydown", e => keys[e.code] = true);
addEventListener("keyup", e => keys[e.code] = false);

// Pointer lock
document.addEventListener("click", () => {
  if (!document.pointerLockElement) {
    renderer.domElement.requestPointerLock();
  }
});

// ===== CAMERA ROTATION (FIXED FPS STYLE) =====
let yaw = 0;
let pitch = 0;

addEventListener("mousemove", e => {
  if (!document.pointerLockElement) return;

  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;

  pitch = Math.max(-1.5, Math.min(1.5, pitch));

  camera.rotation.set(pitch, yaw, 0, "YXZ");
});

// ===== GAME LOOP =====
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.15;

  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw) * -1);
  const right = new THREE.Vector3(forward.z, 0, -forward.x);

  if (keys.KeyW) camera.position.add(forward.clone().multiplyScalar(speed));
  if (keys.KeyS) camera.position.add(forward.clone().multiplyScalar(-speed));
  if (keys.KeyA) camera.position.add(right.clone().multiplyScalar(-speed));
  if (keys.KeyD) camera.position.add(right.clone().multiplyScalar(speed));

  renderer.render(scene, camera);
}

animate();
