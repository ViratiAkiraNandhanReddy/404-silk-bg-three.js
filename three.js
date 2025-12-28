import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

/* ================= SHADERS ================= */

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;

uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uNoiseIntensity;

const float e = 2.718281828459045;

float noise(vec2 t) {
  vec2 r = e * sin(e * t);
  return fract(r.x * r.y * (1.0 + t.x));
}

void main() {
  float rnd = noise(gl_FragCoord.xy);
  vec2 uv = vUv * uScale;
  float t = uSpeed * uTime;

  uv.y += 0.03 * sin(8.0 * uv.x - t);

  float p = 0.6 + 0.4 * sin(
    5.0 * (uv.x + uv.y +
    cos(3.0 * uv.x + 5.0 * uv.y) +
    0.02 * t) +
    sin(20.0 * (uv.x + uv.y - 0.1 * t))
  );

  vec3 col = uColor * p - rnd / 15.0 * uNoiseIntensity;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ================= SCENE ================= */

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

/* ================= UNIFORMS ================= */

const uniforms = {
  uTime: { value: 0 },
  uSpeed: { value: 0.5 },
  uScale: { value: 1.0 },
  uNoiseIntensity: { value: 1.5 },
  uColor: { value: new THREE.Color() }
};

/* ================= MESH ================= */

scene.add(new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
  })
));

/* ================= ANIMATE ================= */

function animate() {
  requestAnimationFrame(animate);

  uniforms.uTime.value += 0.016;

  // 🌈 AUTO COLOR CYCLE
  const hue = (uniforms.uTime.value * 0.05) % 1;
  uniforms.uColor.value.setHSL(hue, 0.6, 0.55);

  renderer.render(scene, camera);
}

animate();

/* ================= RESIZE ================= */

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
