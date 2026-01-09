varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec3 buildingColor = vec3(0.3, 0.3, 0.35);
  vec3 windowColor = vec3(1.0, 0.95, 0.7); // warm light
  
  // Only draw windows on side faces (not top/bottom)
  float isSide = step(0.5, abs(vNormal.x) + abs(vNormal.z));
  
  // Create window grid
  vec2 grid = fract(vUv * vec2(4.0, 6.0)); // 4x6 windows
  float windowMask = step(0.2, grid.x) * step(grid.x, 0.8) 
                   * step(0.15, grid.y) * step(grid.y, 0.85);
  
  // Random lit windows (use noise or instance attribute for variety)
  float lit = step(0.5, fract(sin(floor(vUv.x * 4.0) * 12.9898 + floor(vUv.y * 6.0) * 78.233) * 43758.5453));
  
  vec3 color = mix(buildingColor, windowColor * lit, windowMask * isSide);
  gl_FragColor = vec4(color, 1.0);
}