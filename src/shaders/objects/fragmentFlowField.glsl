uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uGlow;

varying vec3 vColor;
varying float vAlpha;

void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    // Hard core - solid center of particle
    float core = 1.0 - smoothstep(0.15, 0.25, dist);
    
    // Soft halo around the core
    float halo = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Combine: solid core + softer outer glow
    float alpha = max(core, halo * 0.4);
    
    // Add glow effect
    float glow = exp(-dist * 3.0) * uGlow;
    
    // Mix base color with uniform colors
    vec3 finalColor = mix(uColorA, uColorB, vColor.x);
    finalColor += glow * 0.5;
    
    // Apply alpha
    float finalAlpha = alpha * vAlpha;
    
    if (finalAlpha < 0.01) discard;
    
    gl_FragColor = vec4(finalColor, finalAlpha);
}
