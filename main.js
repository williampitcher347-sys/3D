// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Light (IMPORTANT)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Platform (BIG + OBVIOUS)
const platform = new THREE.Mesh(
  new THREE.BoxGeometry(20, 1, 20),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
platform.position.y = 0;
scene.add(platform);

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
