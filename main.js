// ===== SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

// ===== PLAYER =====
const player = {
  height: 1.7,
  yVel: 0,
  onGround: false,
  spawn: new THREE.Vector3(0, 3, 5)
};
camera.position.copy(player.spawn);

// ===== INPUT =====
const keys = {};
addEventListener("keydown", e => keys[e.code] = true);
addEventListener("keyup", e => keys[e.code] = false);

// Pointer lock
const ui = document.getElementById("ui");
ui.onclick = () => document.body.requestPointerLock();
addEventListener("pointerlockchange", () => {
  ui.style.display = document.pointerLockElement ? "none" : "flex";
});

// Mouse look
let pitch = 0;
addEventListener("mousemove", e => {
  if (!document.pointerLockElement) return;
  camera.rotation.y -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.5, Math.min(1.5, pitch));
  camera.rotation.x = pitch;
});

// ===== PLATFORMS =====
const platforms = [];

function platform(x, y, z, w, h, d, color) {
  const p = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color })
  );
  p.position.set(x, y, z);
  p.userData = { w, h, d };
  scene.add(p);
  platforms.push(p);
  return p;
}

// ===== MAIN FLOOR =====
platform(0, 0, 0, 40, 1, 40, 0x5555ff);

// ===== OBBY =====
platform(5, 3, -6, 4, 1, 4, 0x7777ff);
platform(-5, 6, -12, 4, 1, 4, 0x7777ff);
platform(5, 9, -18, 4, 1, 4, 0x7777ff);

// ===== MOVING PLATFORM =====
const moving = platform(0, 12, -24, 4, 1, 4, 0xffaa00);
let moveDir = 1;

// ===== CHECKPOINT =====
const checkpoint = platform(0, 15, -30, 6, 1, 6, 0x00ff00);

// ===== LAVA =====
const lava = platform(0, -6, 0, 100, 1, 100, 0xff0000);

// ===== GAME LOOP =====
function animate() {
  requestAnimationFrame(animate);

  // Move platform
  moving.position.x += 0.04 * moveDir;
  if (moving.position.x > 6 || moving.position.x < -6) moveDir *= -1;

  // Movement
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

  // Gravity
  player.yVel -= 0.02;
  camera.position.y += player.yVel;
  player.onGround = false;

  // Collision
  for (const p of platforms) {
    const dx = Math.abs(camera.position.x - p.position.x);
    const dz = Math.abs(camera.position.z - p.position.z);

    if (dx < p.userData.w / 2 && dz < p.userData.d / 2) {
      const top = p.position.y + p.userData.h / 2;
      const feet = camera.position.y - player.height / 2;

      if (feet <= top && player.yVel <= 0) {
        camera.position.y = top + player.height / 2;
        player.yVel = 0;
        player.onGround = true;

        if (p === moving) {
          camera.position.x += 0.04 * moveDir;
        }
      }
    }
  }

  // Jump
  if (keys.Space && player.onGround) {
    player.yVel = 0.35;
  }

  // Lava death
  if (camera.position.y < -5) {
    camera.position.copy(player.spawn);
    player.yVel = 0;
  }

  // Checkpoint save
  if (
    Math.abs(camera.position.x - checkpoint.position.x) < 3 &&
    Math.abs(camera.position.z - checkpoint.position.z) < 3
  ) {
    player.spawn.copy(checkpoint.position).add(new THREE.Vector3(0, 3, 0));
  }

  renderer.render(scene, camera);
}

animate();
