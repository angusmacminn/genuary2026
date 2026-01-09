varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  
  // Transform normal by instance matrix
  vNormal = mat3(instanceMatrix) * normal;
  
  // Apply instance transformation then view/projection
  vec4 instancePosition = instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
}