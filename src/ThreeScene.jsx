import * as THREE from 'three';

// 1️⃣ Create scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// 2️⃣ Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// 3️⃣ Create cube
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: "orange" });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// 4️⃣ Create plane with text using canvas
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 256;
const ctx = canvas.getContext('2d');
ctx.font = '48px Arial';
ctx.fillStyle = 'white';
ctx.fillText('Hello', 50, 100);

const textTexture = new THREE.CanvasTexture(canvas);
const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.5), textMaterial);
textPlane.position.y = 3; // move above cube
scene.add(textPlane);

// 5️⃣ Position camera
camera.position.z = 8;

// 6️⃣ Animation loop
function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}
export default ThreeScene;