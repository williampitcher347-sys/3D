import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// Light
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

// ===== PLAYER =====
const player = {
  height: 1.7,
  velocity: new THREE.Vector3(),
  onGround: false,
  spawn: new THREE.Vector3(0, 3, 5)
};

camera.position.copy(player.spawn);

// ===== CONTROLS =====
const keys = {};
addEventListener("keydown", e => keys[e.code] = true);
addEventListener("keyup", e => keys[e.code] = false);

// Pointer lock
document.body.onclick = () => document.body.requestPointerLock();
addEventListener("mousemove", e => {
  if (document.pointerLockElement) {
    camera.rotation.y -= e.movementX * 0.002;
    camera.rotation.x -= e.movementY * 0.002;
    camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x));
  }
});

// ===== PLATFORMS =====
const platforms = [];

function platform(x, y, z, w = 4, h = 1, d = 4, color = 0x4444ff) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(x, y, z);
  mesh.userData = { w, h, d };
  scene.add(mesh);
  platforms.push(mesh);
  return mesh;
}

platform(0, 0, 0, 20, 1, 20);
platform(5, 3, -6);
platform(-5, 6, -12);
platform(0, 9, -18);

// ===== MOVING PLATFORM =====
const moving = platform(8, 5, -10, 4, 1, 4, 0xffaa00);
let moveDir = 1;

// ===== CHECKPOINT =====
const checkpoint = platform(0, 12, -22, 3, 1, 3, 0x00ff00);

// ===== COIN =====
const coin = new THREE.Mesh(
  new THREE.TorusGeometry(0.5, 0.2, 16, 32),
  new THREE.MeshStandardMaterial({ color: 0xffff00 })
);
coin.position.set(-5, 7.5, -12);
scene.add(coin);
let coinCollected = false;

// ===== LAVA =====
const lava = platform(0, -5, 0, 100, 1, 100, 0xff0000);

// ===== GAME LOOP =====
function animate() {
  requestAnimationFrame(animate);

  // Moving platform motion
  moving.position.x += 0.03 * moveDir;
  if (moving.position.x > 12 || moving.position.x < 4) moveDir *= -1;

  // Coin spin
  if (!coinCollected) coin.rotation.y += 0.05;

  // Movement
  const speed = 0.1;
  const dir = new THREE.Vector3(
    (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0),
    0,
    (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0)
  ).normalize().applyEuler(camera.rotation);

  camera.position.add(dir.multiplyScalar(speed));

  // Gravity
  player.velocity.y -= 0.02;
  camera.position.y += player.velocity.y;
  player.onGround = false;

  // Ground collision (stable)
  platforms.forEach(p => {
    const dx = Math.abs(camera.position.x - p.position.x);
    const dz = Math.abs(camera.position.z - p.position.z);

    if (
      dx < p.userData.w / 2 &&
      dz < p.userData.d / 2
    ) {
      const top = p.position.y + p.userData.h / 2 + player.height / 2;
      if (camera.position.y <= top && player.velocity.y <= 0) {
        camera.position.y = top;
        player.velocity.y = 0;
        player.onGround = true;

        // Move with moving platform
        if (p === moving) camera.position.x += 0.03 * moveDir;
      }
    }
  });

  // Jump
  if (keys.Space && player.onGround) {
    player.velocity.y = 0.35;
  }

  // Lava death
  if (camera.position.y < -4) {
    camera.position.copy(player.spawn);
    player.velocity.set(0, 0, 0);
  }

  // Checkpoint save
  if (
    Math.abs(camera.position.x - checkpoint.position.x) < 1.5 &&
    Math.abs(camera.position.z - checkpoint.position.z) < 1.5
  ) {
    player.spawn.copy(checkpoint.position).add(new THREE.Vector3(0, 3, 0));
  }

  // Coin collect
  if (
    !coinCollected &&
    camera.position.distanceTo(coin.position) < 1.5
  ) {
    coinCollected = true;
    scene.remove(coin);
    console.log("Coin collected!");
  }

  renderer.render(scene, camera);
}

animate();
