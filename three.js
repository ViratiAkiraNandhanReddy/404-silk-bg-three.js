import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

/* ===================== SHADERS ===================== */

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
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  vec2 r = e * sin(e * texCoord);
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * uv;
}

void main() {
  float rnd = noise(gl_FragCoord.xy);

  vec2 uv = rotateUvs(vUv * uScale, uRotation);
  vec2 tex = uv;
  float t = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - t);

  float pattern = 0.6 +
    0.4 * sin(
      5.0 * (tex.x + tex.y +
      cos(3.0 * tex.x + 5.0 * tex.y) +
      0.02 * t) +
      sin(20.0 * (tex.x + tex.y - 0.1 * t))
    );

  vec3 color = uColor * pattern - rnd / 15.0 * uNoiseIntensity;
  gl_FragColor = vec4(color, 1.0);
}
`;

/* ===================== SCENE ===================== */

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(
  -1, 1, 1, -1, 0.1, 10
);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

/* ===================== UNIFORMS ===================== */

const uniforms = {
  uTime: { value: 0 },
  uSpeed: { value: 0.5 },
  uScale: { value: 1.0 },
  uRotation: { value: 0.0 },
  uNoiseIntensity: { value: 1.5 },
  uColor: { value: new THREE.Color('#8604f8') }
};

/* ===================== MESH ===================== */

const geometry = new THREE.PlaneGeometry(2, 2);

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

/* ===================== ANIMATION ===================== */

function animate() {
  requestAnimationFrame(animate);
  uniforms.uTime.value += 0.016;
  renderer.render(scene, camera);
}

// function animate() {
//   requestAnimationFrame(animate);

//   // change color over time
//   const t = uniforms.uTime.value;
//   uniforms.uColor.value.setHSL((t * 0.1) % 1, 0.5, 0.5);

//   uniforms.uTime.value += 0.016;
//   renderer.render(scene, camera);
// }

animate();

/* ===================== RESIZE ===================== */

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
