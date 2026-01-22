// ===== BASIC SETUP =====
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

// ===== PLAYER =====
const player = {
  height: 1.7,
  yVelocity: 0,
  onGround: false,
  spawn: new THREE.Vector3(0, 3, 5)
};

camera.position.copy(player.spawn);

// ===== INPUT =====
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Pointer lock
const ui = document.getElementById("ui");
ui.onclick = () => document.body.requestPointerLock();

document.addEventListener("pointerlockchange", () => {
  ui.style.display = document.pointerLockElement ? "none" : "flex";
});

// Mouse look (FIXED)
let pitch = 0;
document.addEventListener("mousemove", e => {
  if (!document.pointerLockElement) return;

  camera.rotation.y -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.5, Math.min(1.5, pitch));
  camera.rotation.x = pitch;
});

// ===== PLATFORMS =====
const platforms = [];

function makePlatform(x, y, z, w, h, d, color = 0x4444ff) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(x, y, z);
  mesh.userData = { w, h, d };
  scene.add(mesh);
  platforms.push(mesh);
}

// Main floor (WORKS)
makePlatform(0, 0, 0, 30, 1, 30);

// Obby path
makePlatform(4, 3, -6, 4, 1, 4);
makePlatform(-4, 6, -12, 4, 1, 4);
makePlatform(4, 9, -18, 4, 1, 4);
makePlatform(0, 12, -24, 6, 1, 6, 0x00ff00);

// ===== GAME LOOP =====
function animate() {
  requestAnimationFrame(animate);

  // ===== MOVEMENT =====
  const speed = 0.1;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3().crossVectors(forward, camera.up);

  if (keys.KeyW) camera.position.add(forward.clone().multiplyScalar(speed));
  if (keys.KeyS) camera.position.add(forward.clone().multiplyScalar(-speed));
  if (keys.KeyA) camera.position.add(right.clone().multiplyScalar(-speed));
  if (keys.KeyD) camera.position.add(right.clone().multiplyScalar(speed));

  // ===== GRAVITY =====
  player.yVelocity -= 0.02;
  camera.position.y += player.yVelocity;
  player.onGround = false;

  // ===== COLLISION (NO TELEPORTING) =====
  for (const p of platforms) {
    const dx = Math.abs(camera.position.x - p.position.x);
    const dz = Math.abs(camera.position.z - p.position.z);

    if (
      dx < p.userData.w / 2 &&
      dz < p.userData.d / 2
    ) {
      const platformTop = p.position.y + p.userData.h / 2;
      const feet = camera.position.y - player.height / 2;

      if (feet <= platformTop && player.yVelocity <= 0) {
        camera.position.y = platformTop + player.height / 2;
        player.yVelocity = 0;
        player.onGround = true;
      }
    }
  }

  // ===== JUMP =====
  if (keys.Space && player.onGround) {
    player.yVelocity = 0.35;
  }

  // ===== RESPAWN =====
  if (camera.position.y < -20) {
    camera.position.copy(player.spawn);
    player.yVelocity = 0;
  }

  renderer.render(scene, camera);
}

animate();
