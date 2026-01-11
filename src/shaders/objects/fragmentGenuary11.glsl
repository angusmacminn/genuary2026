uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

#define PI 3.14159265359

float simplexNoise(vec2 uv) {
    return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}   

void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    
    vec2 centeredUV = uv - 0.5;
    centeredUV.x *= aspect;
    
    // gradient background
    float gradient = length(centeredUV) * 0.8;
    float noise = simplexNoise(centeredUV * 10.0 + uTime * 0.1);
    
    // pulsing
    float pulse = sin(uTime * 0.5) * 0.1 + 0.9;
    float pulseNoise = simplexNoise(centeredUV * 10.0 + uTime * 0.1) * 0.1;
    
    // Dark background colors
    vec3 bgColor1 = vec3(0.02, 0.45, 0.03);
    vec3 bgColor2 = vec3(0.05, 0.1, 0.08);
    
    vec3 col = mix(bgColor2, bgColor1, gradient * pulse + pulseNoise);
    
    // vignette
    float vignette = 1.0 - gradient * 0.5;
    col *= vignette;
    
    // scanlines
    float scanline = sin(uv.y * uResolution.y * 1.0) * 0.02 + 1.0;
    col *= scanline;
    
    gl_FragColor = vec4(col, 1.0);
}
