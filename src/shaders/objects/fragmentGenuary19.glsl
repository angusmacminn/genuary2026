uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

// Simple hash function for randomness per cell
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;
    float gridSize = 16.0;
    
    // Get cell coordinates
    vec2 cellId = floor(uv * gridSize);
    vec2 cellUv = fract(uv * gridSize);
    
    // Calculate cell center in UV space
    vec2 cellCenter = (cellId + 0.5) / gridSize;
    
    // Distance from mouse to this cell's center
    float distToMouse = length(uMouse - cellCenter);
    
    // Smooth hover influence based on distance (affects ~1 cell radius)
    float cellRadius = 1.0 / gridSize;
    float hoverInfluence = 1.0 - smoothstep(0.0, cellRadius * 4.2, distToMouse);
    
    // Center the cell UV (-0.5 to 0.5)
    vec2 centeredUv = cellUv - 0.5;
    
    // Distance from center of THIS cell
    float distFromCenter = length(centeredUv);
    
    // Unique phase offset per cell
    float cellRandom = hash(cellId);
    float phaseOffset = cellRandom * 6.28318;
    
    // === RIPPLE WITHIN EACH CELL ===
    float rippleFrequency = 10.0;
    float rippleSpeed = 2.0;
    
    // Speed up ripple when hovered
    float boostedSpeed = rippleSpeed + hoverInfluence * 1.4;
    
    float ripple = sin(distFromCenter * rippleFrequency - uTime * boostedSpeed + phaseOffset);
    ripple = ripple * 0.5 + 0.5;
    
    // Fade ripple at edges of cell
    float edgeFade = 1.0 - smoothstep(0.3, 0.5, distFromCenter);
    ripple *= edgeFade;
    
    // Base colors
    vec3 color1 = vec3(0.05, 0.5, 0.2);   // dark green
    vec3 color2 = vec3(0.2, 0.8, 0.1);    // green
    vec3 cellColor = mix(color1, color2, ripple);
    
    // Hover colors
    vec3 hoverColor1 = vec3(0.8, 0.2, 0.4);  // magenta
    vec3 hoverColor2 = vec3(1.0, 0.6, 0.2);  // orange
    vec3 hoverCellColor = mix(hoverColor1, hoverColor2, ripple);
    
    // Smoothly blend to hover color based on influence
    cellColor = mix(cellColor, hoverCellColor, hoverInfluence);
    
    // Resolution-independent border
    float borderPixels = 1.0;
    vec2 fw = fwidth(cellUv) * borderPixels;
    
    float borderMask = smoothstep(0.0, fw.x, cellUv.x) * smoothstep(0.0, fw.y, cellUv.y)
                     * smoothstep(0.0, fw.x, 1.0 - cellUv.x) * smoothstep(0.0, fw.y, 1.0 - cellUv.y);
    cellColor *= borderMask;
    
    gl_FragColor = vec4(cellColor, 1.0);
}
