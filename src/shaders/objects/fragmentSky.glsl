varying vec3 vWorldPosition;

void main() {
  // Normalize height for gradient (0 = bottom, 1 = top)
  float height = normalize(vWorldPosition).y;
  float t = height * 0.5 + 0.5; // Remap from -1,1 to 0,1
  
  // Nighttime sky colors
  vec3 horizonColor = vec3(0.15, 0.1, 0.2);     // Dark purple at horizon
  vec3 midColor = vec3(0.05, 0.05, 0.15);       // Deep navy
  vec3 zenithColor = vec3(0.02, 0.02, 0.08);    // Near black at top
  vec3 groundColor = vec3(0.02, 0.02, 0.05);    // Very dark below
  vec3 glowColor = vec3(0.25, 0.12, 0.18);      // Faint city glow on horizon
  
  vec3 color;
  
  if (t < 0.45) {
    // Below horizon
    color = mix(groundColor, glowColor, smoothstep(0.3, 0.45, t));
  } else if (t < 0.55) {
    // Horizon glow band
    color = mix(glowColor, horizonColor, smoothstep(0.45, 0.55, t));
  } else if (t < 0.7) {
    // Horizon to mid sky
    color = mix(horizonColor, midColor, smoothstep(0.55, 0.7, t));
  } else {
    // Mid sky to zenith
    color = mix(midColor, zenithColor, smoothstep(0.7, 1.0, t));
  }
  
  gl_FragColor = vec4(color, 1.0);
}
